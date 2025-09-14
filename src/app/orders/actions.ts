"use server";
import db from "@/libs/db";
import paths from "@/libs/paths";
import { getCurrentUser } from "@/libs/session";
import { MovementType, StatusDoing, StatusPayment } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface OrderFormState {
  errors?:
  | {
    product?: string[];
    quantity?: string[];
    _form?: string[];
  }
  | false;
}

interface FormData {
  customerId: number;
  products: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export async function createOrder(
  formData: FormData
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        errors: {
          _form: ["Usuario no autenticado"],
        },
      };
    }

    await db.$transaction(async (tx) => {
      // 1. Crear el movimiento de tipo ORDERED
      const movement = await tx.movement.create({
        data: {
          type: MovementType.ORDERED,
          userId: user.id,
        },
      });

      // 2. Calcular el total de la orden
      let orderTotal = 0;
      const orderDetails: { productName: string; quantity: number; price: number }[] = [];

      // 3. Para cada producto, aplicar FIFO en lotes
      for (const product of formData.products) {
        let remainingQty = product.quantity;


        // Buscar lotes disponibles del producto ordenados por fecha de ingreso (FIFO)
        const batches = await tx.batch.findMany({
          where: {
            productId: product.productId,
            marketQuantity: {
              gt: 0,
            },
          },
          orderBy: {
            createdAt: "asc", // FIFO
          },
        });

        // Verificar stock total disponible
        const totalAvailable = batches.reduce((sum, batch) => sum + batch.marketQuantity, 0);
        if (totalAvailable < product.quantity) {
          throw new Error(`Stock insuficiente para ${product.productName}`);
        }

        // Agregar a detalles de orden
        orderDetails.push({
          productName: product.productName,
          quantity: product.quantity,
          price: product.price,
        });
        orderTotal += product.quantity * product.price;

        // Asignar cantidades a los lotes (FIFO)
        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const qtyToTake = Math.min(batch.marketQuantity, remainingQty);

          // Crear detalle de movimiento para este lote
          await tx.movementDetail.create({
            data: {
              movementId: movement.id,
              batchId: batch.id,
              quantity: qtyToTake,
            },
          });

          // Actualizar lote
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              marketQuantity: {
                decrement: qtyToTake,
              },
              reservedQuantity: {
                increment: qtyToTake,
              },
            },
          });

          remainingQty -= qtyToTake;
        }
      }

      // 4. Crear la orden con sus detalles
      await tx.order.create({
        data: {
          movementId: movement.id,
          customerId: formData.customerId,
          statusDoing: StatusDoing.PENDING,
          statusPayment: StatusPayment.UNPAID,
          total: orderTotal,
          details: {
            createMany: {
              data: orderDetails,
            },
          },
        },
      });
    });

    revalidatePath(paths.orders());
    return { errors: false };
  } catch (error) {
    console.log("error: ", error);
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    } else {
      return {
        errors: {
          _form: ["Ocurrió un error desconocido"],
        },
      };
    }
  }
}
export async function confirmOrder(
  orderId: number,
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        errors: {
          _form: ["Usuario no autenticado"],
        },
      };
    }

    await db.$transaction(async (tx) => {
      // 1. Obtener la orden y sus detalles
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          movement: {
            include: {
              movementDetail: {
                include: {
                  batch: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        throw new Error("Orden no encontrada");
      }

      // 2. Crear el movimiento de tipo SOLD
      const movement = await tx.movement.create({
        data: {
          type: MovementType.SOLD,
          userId: user.id,
        },
      });

      // 3. Actualizar la orden
      await tx.order.update({
        where: { id: orderId },
        data: {
          statusPayment: StatusPayment.PAID,
        },
      });

      // 4. Crear detalles de movimiento y actualizar lotes
      for (const detail of order.movement.movementDetail) {
        // Crear nuevo detalle de movimiento para la venta
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId: detail.batchId,
            quantity: detail.quantity,
          },
        });

        // Actualizar el lote: mover de reservado a vendido
        await tx.batch.update({
          where: { id: detail.batchId },
          data: {
            reservedQuantity: {
              decrement: detail.quantity,
            },
            soltQuantity: {
              increment: detail.quantity,
            },
          },
        });
      }

      db.sell.create({
        data: {
          orderId: order.id,
          movementId: movement.id,
        }
      });
    });

    revalidatePath(paths.orders());
    return { errors: false };
  } catch (error) {
    console.error("error: ", error);
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    } else {
      return {
        errors: {
          _form: ["Ocurrió un error desconocido"],
        },
      };
    }
  }
}



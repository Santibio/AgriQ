"use server";
import db from "@/libs/db";
import paths from "@/libs/paths";
import { getCurrentUser } from "@/libs/session";
import { MovementType, ShipmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface ProductionFormState {
  errors?:
    | {
        product?: string[];
        quantity?: string[];
        _form?: string[];
      }
    | false;
}

interface FormData {
  batchId: number;
  quantity: number;
}

export async function createShipment(
  formData: FormData[]
): Promise<ProductionFormState> {
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
      // 1. Crear el movimiento de tipo SENT
      const movement = await tx.movement.create({
        data: {
          type: MovementType.SENT,
          userId: user.id,
        },
      });

      await tx.shipment.create({
        data: {
          movementId: movement.id,
          status: ShipmentStatus.PENDING,
        },
      });

      // 2. Crear los detalles y actualizar los lotes
      for (const item of formData) {
        const { batchId, quantity } = item;
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId,
            quantity,
          },
        });
        await tx.batch.update({
          where: { id: batchId },
          data: {
            depositQuantity: {
              decrement: quantity,
            },
            sentQuantity: {
              increment: quantity,
            },
          },
        });
      }
    });

    revalidatePath(paths.shipments());
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

export async function editShipment(
  movementId: number,
  formData: FormData[]
): Promise<ProductionFormState> {
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
      // 1. Recupera los detalles previos
      const prevDetails = await tx.movementDetail.findMany({
        where: { movementId },
      });
      // 2. Restaura el stock de los lotes anteriores
      for (const detail of prevDetails) {
        await tx.batch.update({
          where: { id: detail.batchId },
          data: {
            depositQuantity: {
              increment: detail.quantity,
            },
            sentQuantity: {
              decrement: detail.quantity,
            },
          },
        });
      }
      // 3. Elimina los detalles previos
      await tx.movementDetail.deleteMany({
        where: { movementId },
      });
      // 4. Crea los nuevos detalles y descuenta el stock
      for (const item of formData) {
        const { batchId, quantity } = item;
        await tx.movementDetail.create({
          data: {
            movementId,
            batchId,
            quantity,
          },
        });
        await tx.batch.update({
          where: { id: batchId },
          data: {
            depositQuantity: {
              decrement: quantity,
            },
            sentQuantity: {
              increment: quantity,
            },
          },
        });
      }
    });

    revalidatePath(paths.shipments());
    return { errors: false };
  } catch (error) {
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

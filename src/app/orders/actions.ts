'use server'
import db from '@/lib/db'
import { saveImage } from '@/lib/helpers/images'
import paths from '@/lib/paths'
import { getCurrentUser } from '@/lib/session'
import {
  MovementType,
  PaymentMethod,
  StatusDoing,
  StatusPayment,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface OrderFormState {
  errors?:
    | {
        product?: string[]
        quantity?: string[]
        _form?: string[]
      }
    | false
}

interface FormData {
  customerId: number
  products: {
    productId: number
    productName: string
    quantity: number
    price: number
  }[]
}

export async function createOrder(formData: FormData): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }

    await db.$transaction(async tx => {
      // 1. Crear el movimiento de tipo ORDERED
      const movement = await tx.movement.create({
        data: {
          type: MovementType.ORDERED,
          userId: user.id,
        },
      })
      console.log('🚀 ~ createOrder ~ movement:', movement)

      // 2. Calcular el total de la orden
      let orderTotal = 0
      const orderDetails: {
        productName: string
        quantity: number
        price: number
      }[] = []

      // 3. Para cada producto, aplicar FIFO en lotes
      for (const product of formData.products) {
        let remainingQty = product.quantity

        // Buscar lotes disponibles del producto ordenados por fecha de ingreso (FIFO)
        const batches = await tx.batch.findMany({
          where: {
            productId: product.productId,
            marketQuantity: {
              gt: 0,
            },
          },
          orderBy: {
            createdAt: 'asc', // FIFO
          },
        })

        // Verificar stock total disponible
        const totalAvailable = batches.reduce(
          (sum, batch) => sum + batch.marketQuantity,
          0,
        )
        if (totalAvailable < product.quantity) {
          throw new Error(`Stock insuficiente para ${product.productName}`)
        }

        // Agregar a detalles de orden
        orderDetails.push({
          productName: product.productName,
          quantity: product.quantity,
          price: product.price,
        })
        orderTotal += product.quantity * product.price

        // Asignar cantidades a los lotes (FIFO)
        for (const batch of batches) {
          if (remainingQty <= 0) break

          const qtyToTake = Math.min(batch.marketQuantity, remainingQty)

          // Crear detalle de movimiento para este lote
          await tx.movementDetail.create({
            data: {
              movementId: movement.id,
              batchId: batch.id,
              quantity: qtyToTake,
            },
          })

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
          })

          remainingQty -= qtyToTake
        }
      }

      // 4. Crear la orden con sus detalles
      await tx.order.create({
        data: {
          customerId: formData.customerId,
          statusDoing: StatusDoing.PENDING,
          statusPayment: StatusPayment.UNPAID,
          total: orderTotal,
          movements: {
            connect: {
              id: movement.id,
            },
          },
        },
      })
    })

    revalidatePath(paths.orders())
    return { errors: false }
  } catch (error) {
    console.log('error: ', error)
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Ocurrió un error desconocido'],
        },
      }
    }
  }
}
export async function editOrder(
  orderId: number,
  movementId: number,
  formData: FormData,
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }

    await db.$transaction(async tx => {
      // 1. Revertir el stock del movimiento anterior
      const oldMovementDetails = await tx.movementDetail.findMany({
        where: { movementId: movementId },
      })

      for (const detail of oldMovementDetails) {
        await tx.batch.update({
          where: { id: detail.batchId },
          data: {
            marketQuantity: { increment: detail.quantity },
            reservedQuantity: { decrement: detail.quantity },
          },
        })
      }

      // 2. Eliminar los detalles de movimiento antiguos
      await tx.movementDetail.deleteMany({
        where: { movementId: movementId },
      })

      // 3. Calcular el nuevo total y detalles de la orden
      let orderTotal = 0
      const newOrderDetails: {
        productName: string
        quantity: number
        price: number
      }[] = []

      // 4. Procesar los nuevos productos y crear nuevos detalles de movimiento
      for (const product of formData.products) {
        let remainingQty = product.quantity

        const batches = await tx.batch.findMany({
          where: {
            productId: product.productId,
            marketQuantity: { gt: 0 },
          },
          orderBy: { createdAt: 'asc' },
        })

        const totalAvailable = batches.reduce(
          (sum, batch) => sum + batch.marketQuantity,
          0,
        )
        if (totalAvailable < product.quantity) {
          throw new Error(`Stock insuficiente para ${product.productName}`)
        }

        newOrderDetails.push({
          productName: product.productName,
          quantity: product.quantity,
          price: product.price,
        })
        orderTotal += product.quantity * product.price

        for (const batch of batches) {
          if (remainingQty <= 0) break

          const qtyToTake = Math.min(batch.marketQuantity, remainingQty)

          await tx.movementDetail.create({
            data: {
              movementId: movementId,
              batchId: batch.id,
              quantity: qtyToTake,
            },
          })

          await tx.batch.update({
            where: { id: batch.id },
            data: {
              marketQuantity: { decrement: qtyToTake },
              reservedQuantity: { increment: qtyToTake },
            },
          })

          remainingQty -= qtyToTake
        }
      }

      // 5. Actualizar la orden y sus detalles
      // Eliminar detalles antiguos de la orden
      await tx.orderDetail.deleteMany({
        where: { orderId: orderId },
      })

      // Actualizar la orden principal
      await tx.order.update({
        where: { id: orderId },
        data: {
          customerId: formData.customerId,
          total: orderTotal,
          details: {
            create: newOrderDetails.map(detail => ({
              productName: detail.productName,
              quantity: detail.quantity,
              price: detail.price,
            })),
          },
        },
      })
    })

    revalidatePath(paths.orders())
    return { errors: false }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Ocurrió un error desconocido'],
        },
      }
    }
  }
}

export async function confirmOrder(
  orderId: number,
  paymentMethod: PaymentMethod,
  paymentProof: File | null,
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }

    // 1. Obtener la orden y sus detalles
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        movements: {
          include: {
            movementDetail: {
              include: {
                batch: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error('Orden no encontrada')
    }
    let movementId = 0
    await db.$transaction(async tx => {
      // 2. Crear el movimiento de tipo SOLD
      const movement = await tx.movement.create({
        data: {
          type: MovementType.SOLD,
          userId: user.id,
          orderId: orderId,
        },
      })

      // 3. Actualizar la orden
      await tx.order.update({
        where: { id: orderId },
        data: {
          statusPayment: StatusPayment.PAID,
          movements: {
            connect: {
              id: movement.id,
            },
          },
        },
      })

      // 4. Crear detalles de movimiento y actualizar lotes
      for (const detail of order.movements[0].movementDetail) {
        // Crear nuevo detalle de movimiento para la venta
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId: detail.batchId,
            quantity: detail.quantity,
          },
        })

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
        })
        movementId = movement.id
      }
    })

    let paymentReceipt = ''
    if (paymentProof) {
      paymentReceipt = await saveImage(paymentProof)
    }

    await db.sell.create({
      data: {
        orderId: order.id,
        movementId: movementId,
        paymentMethod: paymentMethod,
        paymentReceipt: paymentReceipt,
      },
    })

    revalidatePath(paths.orders())
    return { errors: false }
  } catch (error) {
    console.error('error: ', error)
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Ocurrió un error desconocido'],
        },
      }
    }
  }
}

export async function setOrderStatusToReady(
  orderId: number,
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }

    await db.$transaction(async tx => {
      // 1. Obtener la orden y sus detalles
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          movements: {
            include: {
              movementDetail: {
                include: {
                  batch: true,
                },
              },
            },
          },
        },
      })

      if (!order) {
        throw new Error('Orden no encontrada')
      }

      // 2. Crear el movimiento de tipo SOLD
      const movement = await tx.movement.create({
        data: {
          type: MovementType.READY_TO_DELIVER,
          userId: user.id,
        },
      })

      // 4. Crear detalles de movimiento y actualizar lotes
      for (const detail of order.movements[0].movementDetail) {
        // Crear nuevo detalle de movimiento para la venta
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId: detail.batchId,
            quantity: detail.quantity,
          },
        })
      }

      // 1. Actualizar la orden
      await tx.order.update({
        where: { id: orderId },
        data: {
          statusDoing: StatusDoing.READY_TO_DELIVER,
          movements: {
            connect: {
              id: movement.id,
            },
          },
        },
      })
    })

    revalidatePath(paths.orders())
    return { errors: false }
  } catch (error) {
    console.log('error: ', error)
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Ocurrió un error desconocido'],
        },
      }
    }
  }
}

export async function setOrderStatusToDelivered(
  orderId: number,
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }

    await db.$transaction(async tx => {
      // 1. Obtener la orden y sus detalles
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          movements: {
            include: {
              movementDetail: {
                include: {
                  batch: true,
                },
              },
            },
          },
        },
      })

      if (!order) {
        throw new Error('Orden no encontrada')
      }

      // 2. Crear el movimiento de tipo SOLD
      const movement = await tx.movement.create({
        data: {
          type: MovementType.DELIVERED,
          userId: user.id,
        },
      })

      // 4. Crear detalles de movimiento y actualizar lotes
      for (const detail of order.movements[0].movementDetail) {
        // Crear nuevo detalle de movimiento para la venta
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId: detail.batchId,
            quantity: detail.quantity,
          },
        })
      }

      // 1. Actualizar la orden
      await tx.order.update({
        where: { id: orderId },
        data: {
          statusDoing: StatusDoing.DELIVERED,
          movements: {
            connect: {
              id: movement.id,
            },
          },
        },
      })
    })

    revalidatePath(paths.orders())
    return { errors: false }
  } catch (error) {
    console.log('error: ', error)
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Ocurrió un error desconocido'],
        },
      }
    }
  }
}

export async function setOrderStatusToCancel(
  orderId: number,
): Promise<OrderFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }

    await db.$transaction(async tx => {
      // 1. Obtener la orden y sus detalles
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          movements: {
            include: {
              movementDetail: {
                include: {
                  batch: true,
                },
              },
            },
          },
        },
      })

      if (!order) {
        throw new Error('Orden no encontrada')
      }

      // 2. Crear el movimiento de tipo SOLD
      const movement = await tx.movement.create({
        data: {
          type: MovementType.CANCELED,
          userId: user.id,
        },
      })

      // 4. Crear detalles de movimiento y actualizar lotes
      for (const detail of order.movements[0].movementDetail) {
        // Crear nuevo detalle de movimiento para la venta
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId: detail.batchId,
            quantity: detail.quantity,
          },
        })

        if (order.statusPayment === StatusPayment.PAID) {
          // Actualizar el lote: mover de reservado a vendido
          await tx.batch.update({
            where: { id: detail.batchId },
            data: {
              marketQuantity: {
                increment: detail.quantity,
              },
              soltQuantity: {
                decrement: detail.quantity,
              },
            },
          })
        } else {
          await tx.batch.update({
            where: { id: detail.batchId },
            data: {
              marketQuantity: {
                increment: detail.quantity,
              },
              reservedQuantity: {
                decrement: detail.quantity,
              },
            },
          })
        }
      }

      // 1. Actualizar la orden
      await tx.order.update({
        where: { id: orderId },
        data: {
          statusPayment: StatusPayment.CANCELED,
          movements: {
            connect: {
              id: movement.id,
            },
          },
        },
      })
    })

    revalidatePath(paths.orders())
    return { errors: false }
  } catch (error) {
    console.log('error: ', error)
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Ocurrió un error desconocido'],
        },
      }
    }
  }
}

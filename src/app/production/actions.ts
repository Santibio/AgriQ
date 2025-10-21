'use server'
import db from '@/lib/db'
import paths from '@/lib/paths'
import {
  AddProductionInputs,
  CreateProductionFormSchema,
} from '@/lib/schemas/production'
import { getCurrentUser } from '@/lib/session'
import { MovementType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface ProductionFormState {
  errors?:
    | {
        product?: string[]
        quantity?: string[]
        _form?: string[]
      }
    | false
}

export async function createProduction(
  formInput: AddProductionInputs,
): Promise<ProductionFormState> {
  try {
    const parseResult = CreateProductionFormSchema.safeParse(formInput)

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors
      return {
        errors: {
          product: errors.product || [],
          quantity: errors.quantity || [],
        },
      }
    }

    const user = await getCurrentUser()

    if (!user)
      return {
        errors: {
          _form: ['No se encontró el usuario actual'],
        },
      }
    // Crear el movimiento de producción

    await db.$transaction(
      async tx => {
        // 1. Crear el movimiento de producción
        const movement = await tx.movement.create({
          data: {
            type: MovementType.STORED,
            userId: user.id,
          },
        })

        // 2. Crear el nuevo lote (Batch)
        const codeValue = `${parseInt(parseResult.data.product)}-${Date.now()}`
        const batch = await tx.batch.create({
          data: {
            initialQuantity: parseResult.data.quantity,
            depositQuantity: parseResult.data.quantity, // La cantidad inicial va al depósito
            code: codeValue,
            productId: parseInt(parseResult.data.product),
            // Se establecen los demás contadores en 0 por defecto
            marketQuantity: 0,
            sentQuantity: 0,
            receivedQuantity: 0,
            discardedQuantity: 0,
            reservedQuantity: 0,
            soltQuantity: 0,
          },
        })

        // 3. Crear el detalle del movimiento para enlazar el movimiento y el lote
        await tx.movementDetail.create({
          data: {
            batchId: batch.id,
            movementId: movement.id,
            quantity: parseResult.data.quantity,
          },
        })
      },
      {
        timeout: 15000,
      },
    )
  } catch (error) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } }
    }
    return { errors: { _form: ['Something went wrong...'] } }
  }

  revalidatePath(paths.production())
  return { errors: false }

  // redirect(paths.production());
}

export async function editProduction(
  batchId: number,
  formInput: AddProductionInputs,
): Promise<ProductionFormState> {
  try {
    const parseResult = CreateProductionFormSchema.safeParse(formInput)

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors
      return {
        errors: {
          product: errors.product || [],
          quantity: errors.quantity || [],
        },
      }
    }

    const user = await getCurrentUser()

    if (!user)
      return {
        errors: {
          _form: ['No se encontró el usuario actual'],
        },
      }

    await db.$transaction(
      async tx => {
        const movement = await tx.movement.create({
          data: {
            type: MovementType.EDITED,
            userId: user.id,
          },
        })

        const batch = await tx.batch.update({
          where: { id: batchId },
          data: {
            initialQuantity: parseResult.data.quantity,
            depositQuantity: parseResult.data.quantity,
            productId: parseInt(parseResult.data.product),
          },
        })

        await tx.movementDetail.create({
          data: {
            batchId: batch.id,
            movementId: movement.id,
            quantity: parseResult.data.quantity,
          },
        })
      },
      {
        timeout: 15000,
      },
    )
  } catch (error) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } }
    }
    return { errors: { _form: ['Something went wrong...'] } }
  }

  revalidatePath(paths.production())
  return { errors: false }
}

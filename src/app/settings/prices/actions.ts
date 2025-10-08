'use server'

import db from '@/lib/db'
import paths from '@/lib/paths'
import { getCurrentUser } from '@/lib/session'
import { Product } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface PricesFormState {
  errors?:
    | {
        product?: string[]
        quantity?: string[]
        _form?: string[]
      }
    | false
}

interface FormData {
  id: number
  price: number
}

export async function updateProductsPrices(
  formData: FormData[],
): Promise<PricesFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ['Usuario no autenticado'],
        },
      }
    }
    await Promise.all(
      formData.map(p =>
        db.product.update({
          where: { id: p.id },
          data: { price: p.price },
        }),
      ),
    )
    revalidatePath(paths.prices())
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

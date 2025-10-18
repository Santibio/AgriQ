'use server'

import db from '@/lib/db'

// 1. Definimos la estructura de los datos que devolverá la función
export interface DiscardedProduct {
  id: number
  quantity: number
  reason: string
  createdAt: Date
  product: {
    name: string
  }
  user: {
    name: string
    lastName: string
  }
}

// Mapeo de razones del enum a texto legible
const reasonMap = {
  DAMAGED: 'Dañado',
  EXPIRED: 'Vencido',
  OTHER: 'Otro',
}

/**
 * Obtiene los productos descartados basados en los movimientos de tipo 'DISCARDED'.
 * @returns Una promesa que resuelve a un array de DiscardedProduct.
 */
export async function getDiscardedProducts(): Promise<DiscardedProduct[]> {
  try {
    // 2. Buscamos los movimientos que representan un descarte
    const discardMovements = await db.movement.findMany({
      where: {
        type: 'DISCARDED',
        // Aseguramos que el movimiento tenga detalles y un motivo de descarte
        movementDetail: { some: {} },
        discard: { isNot: null },
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: { name: true, lastName: true },
        },
        discard: {
          select: { reason: true },
        },
        movementDetail: {
          take: 1, // Asumimos un producto por movimiento de descarte
          select: {
            quantity: true,
            batch: {
              select: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 3. Mapeamos los datos a una estructura limpia para el frontend
    const discards = discardMovements
      .map(movement => {
        const detail = movement.movementDetail[0]
        // Validamos que todos los datos necesarios existan
        if (!detail || !detail.batch || !movement.user || !movement.discard) {
          return null
        }

        return {
          id: movement.id,
          quantity: detail.quantity,
          reason: reasonMap[movement.discard.reason] || movement.discard.reason,
          createdAt: movement.createdAt,
          product: {
            name: detail.batch.product.name,
          },
          user: {
            name: movement.user.name,
            lastName: movement.user.lastName,
          },
        }
      })
      .filter((discard): discard is DiscardedProduct => discard !== null)

    return discards
  } catch (error) {
    console.error('Error fetching discarded products:', error)
    return []
  }
}

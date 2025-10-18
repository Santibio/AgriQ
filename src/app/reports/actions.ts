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

// Definimos los tipos para el filtro y la respuesta
export type TimeFilter = 'month' | 'quarter' | 'half' | 'year'

export interface DiscardReasonStat {
  reason: string
  count: number
  color: string
}

// Mapeo de razones y colores para consistencia visual
const reasonDetailsMap = {
  DAMAGED: { label: 'Dañado', color: '#dc2626' }, // red-600
  EXPIRED: { label: 'Vencido', color: '#f59e0b' }, // amber-500
  OTHER: { label: 'Otro', color: '#6b7280' }, // gray-500
}

/**
 * Calcula las estadísticas de descarte agrupadas por motivo para un período de tiempo determinado.
 * @param filter - El período de tiempo ('month', 'quarter', 'half', 'year').
 * @returns Una promesa que resuelve a un array con las estadísticas de descarte.
 */
export async function getDiscardReasonStats(
  filter: TimeFilter,
): Promise<DiscardReasonStat[]> {
  const now = new Date()
  let startDate: Date

  // 1. Calculamos la fecha de inicio según el filtro
  switch (filter) {
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3))
      break
    case 'half':
      startDate = new Date(now.setMonth(now.getMonth() - 6))
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1) // Inicio del año actual
      break
    case 'month':
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1))
      break
  }

  try {
    // 2. Consultamos los movimientos de descarte en el rango de fechas
    const discardMovements = await db.movement.findMany({
      where: {
        type: 'DISCARDED',
        createdAt: {
          gte: startDate, // "gte" significa "greater than or equal to"
        },
        discard: { isNot: null },
        movementDetail: { some: {} },
      },
      select: {
        discard: {
          select: {
            reason: true,
          },
        },
        movementDetail: {
          select: {
            quantity: true,
          },
        },
      },
    })

    // 3. Agrupamos y sumamos las cantidades en el servidor
    const stats = new Map<keyof typeof reasonDetailsMap, number>()

    for (const movement of discardMovements) {
      if (movement.discard) {
        const reason = movement.discard.reason
        const quantity = movement.movementDetail.reduce(
          (sum, detail) => sum + detail.quantity,
          0,
        )
        const currentCount = stats.get(reason) || 0
        stats.set(reason, currentCount + quantity)
      }
    }

    // 4. Formateamos la respuesta para el gráfico
    return Array.from(stats.entries()).map(([reason, count]) => ({
      reason: reasonDetailsMap[reason]?.label || 'Desconocido',
      count,
      color: reasonDetailsMap[reason]?.color || '#6b7280',
    }))
  } catch (error) {
    console.error('Error fetching discard reason stats:', error)
    return []
  }
}

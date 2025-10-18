'use server'

import db from '@/lib/db'



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

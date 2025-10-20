'use server'

import db from '@/lib/db'
import { CancelReason } from '@prisma/client' // Importa tu enum de Prisma

// Definimos los tipos para los filtros y la respuesta
export type TimeFilter = 'month' | 'quarter' | 'half' | 'year'

export interface CancellationReasonStat {
  reason: string
  count: number
  color: string
}

// Mapeo de los motivos de cancelación a etiquetas y colores legibles
const reasonDetailsMap: Record<CancelReason, { label: string; color: string }> =
  {
    CUSTOMER_REQUEST: { label: 'Solicitud Cliente', color: '#3b82f6' }, // blue-500
    OUT_OF_STOCK: { label: 'Falta de Stock', color: '#f59e0b' }, // amber-500
    ORDER_LOADED_ERROR: { label: 'Error de Carga', color: '#f43f5e' }, // rose-500
    PAYMENT_EXPIRED: { label: 'Cobro Vencido', color: '#8b5cf6' }, // violet-500
    OTHERS: { label: 'Otros', color: '#6b7280' }, // gray-500
  }

/**
 * Calcula las estadísticas de cancelación de pedidos agrupadas por motivo.
 * @param timeFilter - El período de tiempo ('month', 'quarter', 'half', 'year').
 * @returns Una promesa que resuelve a un array con las estadísticas.
 */
export async function getOrderCancellationStats(
  timeFilter: TimeFilter,
): Promise<CancellationReasonStat[]> {
  const now = new Date()
  let startDate = new Date()

  // 1. Calculamos la fecha de inicio según el filtro de tiempo
  switch (timeFilter) {
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'half':
      startDate.setMonth(now.getMonth() - 6)
      break
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'month':
    default:
      startDate.setMonth(now.getMonth() - 1)
      break
  }

  try {
    // 2. Usamos `groupBy` de Prisma para contar eficientemente
    const groupedCancellations = await db.order.groupBy({
      by: ['cancelReason'],
      where: {
        cancelReason: {
          not: null, // Solo contamos pedidos que tienen un motivo de cancelación
        },
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true, // Contamos por el ID de cada pedido
      },
    })

    // 3. Formateamos los datos para que el gráfico los pueda usar
    const stats = groupedCancellations
      .map(group => {
        if (!group.cancelReason) return null

        const details =
          reasonDetailsMap[group.cancelReason] || reasonDetailsMap.OTHERS
        return {
          reason: details.label,
          count: group._count.id,
          color: details.color,
        }
      })
      .filter(
        (stat): stat is CancellationReasonStat =>
          stat !== null && stat.count > 0,
      )
      .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor

    return stats
  } catch (error) {
    console.error('Error fetching order cancellation stats:', error)
    return []
  }
}

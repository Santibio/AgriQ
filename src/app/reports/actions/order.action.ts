'use server'

import db from '@/lib/db'

// Definimos los tipos para el filtro y la respuesta
export type TimeFilter = 'month' | 'quarter' | 'half' | 'year'

export interface OrderStatusStat {
  status: string
  count: number
  color: string
}

// Mapeo de estados de pago a etiquetas y colores legibles
const statusDetailsMap = {
  PAID: { label: 'Cobrados', color: '#22c55e' }, // green-500
  PENDING: { label: 'Pendientes', color: '#f59e0b' }, // amber-500
  CANCELLED: { label: 'Cancelados', color: '#ef4444' }, // red-600
}

/**
 * Calcula las estadísticas de pedidos agrupados por estado de pago para un período de tiempo.
 * @param filter - El período de tiempo ('month', 'quarter', 'half', 'year').
 * @returns Una promesa que resuelve a un array con las estadísticas de pedidos.
 */
export async function getOrderStatusStatsForToday(): Promise<OrderStatusStat[]> {
  const now = new Date()
  const startOfToday: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  try {
    // 2. Usamos `groupBy` para contar pedidos por `statusPayment` de forma eficiente
    const groupedOrders = await db.order.groupBy({
      by: ['statusPayment'],
      where: {
        createdAt: {
          gte: startOfToday, // Mayor o igual que el inicio del día
          lte: endOfToday, // Menor o igual que el final del día
        },
      },
      _count: {
        id: true, // Contamos los pedidos por su ID
      },
    })

    // 3. Procesamos los resultados para agrupar 'UNPAID' y 'PARCIAL_PAID' como 'Pendientes'
    const stats = new Map<string, number>()
    stats.set(statusDetailsMap.PAID.label, 0)
    stats.set(statusDetailsMap.PENDING.label, 0)
    stats.set(statusDetailsMap.CANCELLED.label, 0)

    for (const group of groupedOrders) {
      const count = group._count.id
      switch (group.statusPayment) {
        case 'PAID':
          stats.set(
            statusDetailsMap.PAID.label,
            (stats.get(statusDetailsMap.PAID.label) || 0) + count,
          )
          break
        case 'UNPAID':
        case 'PARCIAL_PAID':
          stats.set(
            statusDetailsMap.PENDING.label,
            (stats.get(statusDetailsMap.PENDING.label) || 0) + count,
          )
          break
        case 'CANCELLED':
          stats.set(
            statusDetailsMap.CANCELLED.label,
            (stats.get(statusDetailsMap.CANCELLED.label) || 0) + count,
          )
          break
      }
    }

    // 4. Formateamos la respuesta para el gráfico
    return [
      {
        status: statusDetailsMap.PAID.label,
        count: stats.get(statusDetailsMap.PAID.label) || 0,
        color: statusDetailsMap.PAID.color,
      },
      {
        status: statusDetailsMap.PENDING.label,
        count: stats.get(statusDetailsMap.PENDING.label) || 0,
        color: statusDetailsMap.PENDING.color,
      },
      {
        status: statusDetailsMap.CANCELLED.label,
        count: stats.get(statusDetailsMap.CANCELLED.label) || 0,
        color: statusDetailsMap.CANCELLED.color,
      },
    ].filter(stat => stat.count > 0) // Devolvemos solo los estados con pedidos
  } catch (error) {
    console.error('Error fetching order status stats:', error)
    return []
  }
}

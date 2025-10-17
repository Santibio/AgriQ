'use server'

import db from '@/lib/db'

// Definimos los tipos para los filtros y la respuesta
export type TimeFilter = 'day' | 'week' | 'month'
export type MetricFilter = 'quantity' | 'price'
export type SortOrder = 'top' | 'bottom'

export interface SalesRank {
  name: string
  totalQuantity: number
  totalPrice: number
}

/**
 * Obtiene el ranking de los 5 productos más o menos vendidos según varios filtros.
 * @param timeFilter - El período de tiempo ('day', 'week', 'month').
 * @param metricFilter - La métrica para ordenar ('quantity' o 'price').
 * @param sortOrder - El orden ('top' para más vendidos, 'bottom' para menos).
 * @returns Una promesa que resuelve a un array con el ranking de productos.
 */
export async function getSalesRanking({
  timeFilter,
  metricFilter,
  sortOrder,
}: {
  timeFilter: TimeFilter
  metricFilter: MetricFilter
  sortOrder: SortOrder
}): Promise<SalesRank[]> {
  const now = new Date()
  let startDate = new Date()

  // 1. Calculamos la fecha de inicio según el filtro de tiempo (LÓGICA CORREGIDA)
  switch (timeFilter) {
    case 'day':
      // El día de hoy desde las 00:00
      startDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      // Últimos 30 días desde ahora
      startDate.setDate(now.getDate() - 30)
      break
    case 'week':
    default:
      // Últimos 7 días desde ahora
      startDate.setDate(now.getDate() - 7)
      break
  }

  try {
    // 2. Consultamos todas las ventas dentro del período de tiempo
    const salesInPeriod = await db.sale.findMany({
      where: {
        createdAt: {
          gte: startDate, // "gte" significa "mayor o igual que"
          lte: now, // Aseguramos que no se incluyan registros futuros
        },
      },
      include: {
        // Incluimos el pedido y sus detalles para obtener los productos
        order: {
          include: {
            details: true,
          },
        },
      },
    })

    // 3. Agregamos los datos en el servidor
    const aggregated = new Map<
      string,
      { totalQuantity: number; totalPrice: number }
    >()

    for (const sale of salesInPeriod) {
      if (sale.order) {
        for (const detail of sale.order.details) {
          const current = aggregated.get(detail.productName) || {
            totalQuantity: 0,
            totalPrice: 0,
          }
          current.totalQuantity += detail.quantity
          current.totalPrice += detail.quantity * detail.price
          aggregated.set(detail.productName, current)
        }
      }
    }

    // 4. Convertimos el mapa a un array, ordenamos y cortamos
    const ranked = Array.from(aggregated.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const valueA = metricFilter === 'price' ? a.totalPrice : a.totalQuantity
        const valueB = metricFilter === 'price' ? b.totalPrice : b.totalQuantity
        // Si es 'top', ordenamos de mayor a menor (descendente), si es 'bottom', al revés.
        return sortOrder === 'top' ? valueB - valueA : valueA - valueB
      })

    return ranked.slice(0, 5) // Devolvemos solo los 5 primeros del ranking
  } catch (error) {
    console.error('Error fetching sales ranking:', error)
    return []
  }
}

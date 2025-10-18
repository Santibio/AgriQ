'use server'

import db from '@/lib/db'

// Definimos los tipos para los filtros y la respuesta
export type TimeFilter = 'week' | 'month' | 'year'
export type MetricFilter = 'price' | 'quantity'
export type SortOrder = 'top' | 'bottom'

export interface ClientSaleRank {
  name: string
  totalQuantity: number
  totalPrice: number
}

/**
 * Obtiene el ranking de clientes (más o menos compradores) según varios filtros.
 * @param timeFilter - El período de tiempo ('week', 'month', 'year').
 * @param metricFilter - La métrica para ordenar ('quantity' o 'price').
 * @param sortOrder - El orden ('top' para mejores, 'bottom' para peores).
 * @returns Una promesa que resuelve a un array con el ranking de clientes.
 */
export async function getClientSalesRanking({
  timeFilter,
  metricFilter,
  sortOrder,
}: {
  timeFilter: TimeFilter
  metricFilter: MetricFilter
  sortOrder: SortOrder
}): Promise<ClientSaleRank[]> {
  const now = new Date()
  let startDate = new Date()

  // 1. Calculamos la fecha de inicio según el filtro de tiempo
  switch (timeFilter) {
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1) // Inicio del año actual
      break
    case 'month':
      startDate.setDate(now.getDate() - 30) // Últimos 30 días
      break
    case 'week':
    default:
      startDate.setDate(now.getDate() - 7) // Últimos 7 días
      break
  }

  try {
    // 2. Consultamos todas las ventas dentro del período de tiempo
    const salesInPeriod = await db.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        order: {
          include: {
            details: true,
            customer: true, // Incluimos el cliente para obtener su nombre
          },
        },
      },
    })

    // 3. Agregamos los datos por cliente en el servidor
    const aggregated = new Map<
      string,
      { totalQuantity: number; totalPrice: number }
    >()

    for (const sale of salesInPeriod) {
      if (sale.order && sale.order.customer) {
        const clientName = `${sale.order.customer.name} ${sale.order.customer.lastName}`
        const current = aggregated.get(clientName) || {
          totalQuantity: 0,
          totalPrice: 0,
        }

        for (const detail of sale.order.details) {
          current.totalQuantity += detail.quantity
          current.totalPrice += detail.quantity * detail.price
        }
        aggregated.set(clientName, current)
      }
    }

    // 4. Convertimos el mapa a un array y lo ordenamos
    const ranked = Array.from(aggregated.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const valueA = metricFilter === 'price' ? a.totalPrice : a.totalQuantity
        const valueB = metricFilter === 'price' ? b.totalPrice : b.totalQuantity
        return sortOrder === 'top' ? valueB - valueA : valueA - b.totalQuantity
      })

    return ranked
  } catch (error) {
    console.error('Error fetching client sales ranking:', error)
    return []
  }
}

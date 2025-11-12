'use server'

import db from '@/lib/db'

// Definimos los tipos para los Búsqueda y la respuesta
export type TimeFilter = 'day' | 'week' | 'month'
export type MetricFilter = 'quantity' | 'price'
export type SortOrder = 'top' | 'bottom'

export interface SalesRank {
  name: string
  totalQuantity: number
  totalPrice: number
}

/**
 * Obtiene el ranking de los 5 productos más o menos vendidos según varios Búsqueda.
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
  const startDate = new Date()

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

    return ranked
  } catch (error) {
    return []
  }
}

export type TimePeriod = 'today' | '7d' | '30d' | '90d'

export interface SalesChartData {
  series: number[]
  categories: string[]
  products?: string[]
  totalSales: number
  percentageChange: number
}

// Definir un tipo para la venta con detalles del pedido
type SaleWithDetails = {
  order: {
    details: { quantity: number; price: number }[]
  } | null
}

// Helper para calcular el total de una venta
const getSaleTotal = (sale: SaleWithDetails): number => {
  return (
    sale.order?.details.reduce(
      (sum: number, detail: { quantity: number; price: number }) =>
        sum + detail.quantity * detail.price,
      0,
    ) || 0
  )
}

/**
 * Obtiene los datos agregados para el gráfico de ventas.
 * @param timePeriod - El período de tiempo a consultar ('today', '7d', '30d', '90d').
 * @returns Un objeto con los datos listos para el gráfico.
 */
export async function getSalesChartData(
  timePeriod: TimePeriod,
): Promise<SalesChartData> {
  const now = new Date()
  let startDateCurrent = new Date()
  let startDatePrevious = new Date()

  // 1. Definir los rangos de fecha para el período actual y el anterior
  switch (timePeriod) {
    case 'today':
      startDateCurrent = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ) // Hoy a las 00:00
      startDatePrevious = new Date(startDateCurrent)
      startDatePrevious.setDate(startDateCurrent.getDate() - 1) // Ayer a las 00:00
      break
    case '30d':
      startDateCurrent.setDate(now.getDate() - 30)
      startDatePrevious.setDate(now.getDate() - 60)
      break
    case '90d':
      startDateCurrent.setMonth(now.getMonth() - 3)
      startDatePrevious.setMonth(now.getMonth() - 6)
      break
    case '7d':
    default:
      startDateCurrent.setDate(now.getDate() - 7)
      startDatePrevious.setDate(now.getDate() - 14)
      break
  }

  try {
    // 2. Obtener las ventas de ambos períodos
    const sales = await db.sale.findMany({
      where: { createdAt: { gte: startDatePrevious } },
      include: { order: { include: { details: true } } },
      orderBy: { createdAt: 'asc' },
    })

    // 3. Separar y calcular totales
    const currentSales = sales.filter(s => s.createdAt >= startDateCurrent)
    const previousSales = sales.filter(
      s => s.createdAt < startDateCurrent && s.createdAt >= startDatePrevious,
    )

    const totalCurrent = currentSales.reduce(
      (sum, sale) => sum + getSaleTotal(sale),
      0,
    )
    const totalPrevious = previousSales.reduce(
      (sum, sale) => sum + getSaleTotal(sale),
      0,
    )

    // 4. Calcular el cambio porcentual
    const percentageChange =
      totalPrevious > 0
        ? ((totalCurrent - totalPrevious) / totalPrevious) * 100
        : totalCurrent > 0
        ? 100
        : 0

    // 5. Agregar los datos para la serie del gráfico (LÓGICA CORREGIDA)
    let series: number[] = []
    let categories: string[] = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (timePeriod === 'today') {
      series = Array(6).fill(0) // 6 puntos para el día (intervalos de 4 horas)
      categories = ['0-4h', '4-8h', '8-12h', '12-16h', '16-20h', '20-24h']
      currentSales.forEach(sale => {
        const hour = sale.createdAt.getHours()
        const hourIndex = Math.floor(hour / 4)
        if (hourIndex >= 0 && hourIndex < 6) {
          series[hourIndex] += getSaleTotal(sale)
        }
      })
    } else if (timePeriod === '7d') {
      series = Array(7).fill(0)
      const dayFormat = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        categories.push(
          dayFormat.format(date).replace('.', '').toLocaleUpperCase(),
        )
      }
      currentSales.forEach(sale => {
        const daysAgo = Math.floor(
          (today.getTime() - sale.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )
        const seriesIndex = 6 - daysAgo
        if (seriesIndex >= 0 && seriesIndex < 7) {
          series[seriesIndex] += getSaleTotal(sale)
        }
      })
    } else if (timePeriod === '30d') {
      series = Array(4).fill(0)
      categories = ['22-30 días', '15-21 días', '8-14 días', 'Últimos 7 días']
      const dayInMillis = 24 * 60 * 60 * 1000
      currentSales.forEach(sale => {
        const daysAgo = Math.floor(
          (now.getTime() - sale.createdAt.getTime()) / dayInMillis,
        )
        if (daysAgo < 7) {
          series[3] += getSaleTotal(sale)
        } else if (daysAgo < 14) {
          series[2] += getSaleTotal(sale)
        } else if (daysAgo < 21) {
          series[1] += getSaleTotal(sale)
        } else if (daysAgo <= 30) {
          series[0] += getSaleTotal(sale)
        }
      })
    } else if (timePeriod === '90d') {
      series = Array(3).fill(0)
      const monthFormat = new Intl.DateTimeFormat('es-AR', { month: 'short' })
      for (let i = 2; i >= 0; i--) {
        const date = new Date(today)
        date.setMonth(today.getMonth() - i)
        categories.push(
          monthFormat.format(date).replace('.', '').toLocaleUpperCase(),
        )
      }
      currentSales.forEach(sale => {
        const monthsAgo =
          today.getMonth() -
          sale.createdAt.getMonth() +
          12 * (today.getFullYear() - sale.createdAt.getFullYear())
        const seriesIndex = 2 - monthsAgo
        if (seriesIndex >= 0 && seriesIndex < 3) {
          series[seriesIndex] += getSaleTotal(sale)
        }
      })
    }

    return {
      series,
      categories,
      totalSales: totalCurrent,
      percentageChange,
    }
  } catch (error) {
    return { series: [], categories: [], totalSales: 0, percentageChange: 0 }
  }
}

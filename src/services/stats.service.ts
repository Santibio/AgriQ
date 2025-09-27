'use server'

import { PrismaClient } from '@prisma/client'
import { getProductionStats } from './production.service'
import { getSalesStats } from './sales.service'
import { getPendingOrdersCount } from './order.service'

const prisma = new PrismaClient()

interface Stats {
  productionStats: {
    batchesToday: number
    batchesYesterday: number
    productionChange: number
  },
  salesStats: {
    monthlySales: number
    lastMonthSales: number
    salesChange: number
  },
  ordersStats: number
}

export default async function getStats(): Promise<Stats> {
  try {
    // Obtener estadísticas en paralelo para mejor rendimiento
    const [productionStats, salesStats, ordersStats] = await Promise.all([
      getProductionStats(),
      getSalesStats(),
      getPendingOrdersCount(),
    ])

    return {
      productionStats,
      salesStats,
      ordersStats,
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching stats:', error)
    }
    throw new Error(
      'Error al obtener las estadísticas. Por favor, inténtalo de nuevo.',
    )
  } finally {
    await prisma.$disconnect()
  }
}

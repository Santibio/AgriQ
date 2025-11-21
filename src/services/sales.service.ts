import db from '@/lib/db'

export async function getSells() {
  const sells = await db.sale.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      order: {
        include: { customer: true, details: true },
      },
    },
    take: 100,
  })
  return sells
}

export async function getSalesStats() {
  const now = new Date() // Hoy: Viernes 21 Noviembre

  // 1. Calcular el inicio de ESTA semana (Lunes 17 Nov 00:00)
  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay() // 5 (Viernes)

  // Si es Domingo (0) restamos 6 días, si no restamos (día - 1)
  const diff = day === 0 ? 6 : day - 1

  // 21 - 4 = 17 (Lunes)
  startOfWeek.setDate(now.getDate() - diff)
  startOfWeek.setHours(0, 0, 0, 0)

  // 2. Calcular la semana PASADA para comparar (Lunes 10 Nov al Domingo 16 Nov)
  // Esto sirve para calcular el porcentaje de crecimiento/caída
  const startOfLastWeek = new Date(startOfWeek)
  startOfLastWeek.setDate(startOfWeek.getDate() - 7) // Lunes 10

  const endOfLastWeek = new Date(startOfWeek)
  endOfLastWeek.setMilliseconds(-1) // Domingo 16 (23:59:59)

  // 3. Ejecutar consultas en paralelo
  const [currentWeekResult, lastWeekResult] = await Promise.all([
    // Ventas de ESTA semana (Lunes actual hasta AHORA)
    db.sale.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfWeek },
      },
    }),
    // Ventas de la SEMANA PASADA (Lunes pasado a Domingo pasado)
    db.sale.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfLastWeek, lte: endOfLastWeek },
      },
    }),
  ])

  // 4. Calcular resultados
  const weeklySales = currentWeekResult._sum.total || 0
  const lastWeekSales = lastWeekResult._sum.total || 0

  let salesChange = 0
  if (lastWeekSales > 0) {
    salesChange = ((weeklySales - lastWeekSales) / lastWeekSales) * 100
  } else if (weeklySales > 0) {
    salesChange = 100
  }

  return { weeklySales, lastWeekSales, salesChange }
}

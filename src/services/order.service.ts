import db from '@/lib/db'

export async function getPendingOrdersCount(): Promise<number> {
  return db.order.count({
    where: { statusDoing: 'PENDING' },
  })
}

export async function getOrdersStats() {
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

  const [ordersThisWeek, ordersLastWeek] = await Promise.all([
    db.order.count({
      where: { createdAt: { gte: startOfWeek } },
    }),
    db.order.count({
      where: {
        createdAt: { gte: startOfLastWeek, lt: startOfWeek },
      },
    }),
  ])


  let ordersChange = 0
  if (ordersLastWeek > 0) {
    ordersChange = ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100
  } else if (ordersThisWeek > 0) {
    ordersChange = 100
  }

  return {
    ordersThisWeek,
    ordersLastWeek,
    ordersChange,
  }
}

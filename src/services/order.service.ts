import db from '@/lib/db'

export async function getPendingOrdersCount(): Promise<number> {
  return db.order.count({
    where: { statusDoing: 'PENDING' },
  })
}

export async function getOrdersStats() {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  const startOfLastWeek = new Date(lastWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay())
  startOfLastWeek.setHours(0, 0, 0, 0)
  const endOfLastWeek = new Date(startOfLastWeek)
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
  endOfLastWeek.setHours(23, 59, 59, 999)

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

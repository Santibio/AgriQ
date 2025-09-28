import db from '@/lib/db'

export async function getPendingOrdersCount(): Promise<number> {
  return db.order.count({
    where: { statusDoing: 'PENDING' },
  })
}

export async function getOrdersStats() {
  const today = new Date()
  const startOfWeek = new Date(
    today.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1),
    ),
  )
  const startOfLastWeek = new Date(
    startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000,
  )

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

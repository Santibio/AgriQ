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
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    0,
    23,
    59,
    59,
    999,
  )

  const [currentMonthResult, lastMonthResult] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: {
        statusPayment: 'PAID',
        createdAt: { gte: startOfMonth },
      },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: {
        statusPayment: 'PAID',
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
  ])

  const monthlySales = currentMonthResult._sum.total || 0
  const lastMonthSales = lastMonthResult._sum.total || 0

  let salesChange = 0
  if (lastMonthSales > 0) {
    salesChange = ((monthlySales - lastMonthSales) / lastMonthSales) * 100
  } else if (monthlySales > 0) {
    salesChange = 100
  }

  return { monthlySales, lastMonthSales, salesChange }
}

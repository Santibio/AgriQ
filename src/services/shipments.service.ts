import db from '@/lib/db'

export async function getShipmentsStats() {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0))
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999))

  const [shipmentsToday, shipmentsYesterday] = await Promise.all([
    db.shipment.count({
      where: { createdAt: { gte: startOfDay } },
    }),
    db.shipment.count({
      where: {
        createdAt: { gte: startOfYesterday, lte: endOfYesterday },
      },
    }),
  ])

  let shipmentsChange = 0
  if (shipmentsYesterday > 0) {
    shipmentsChange =
      ((shipmentsToday - shipmentsYesterday) / shipmentsYesterday) * 100
  } else if (shipmentsToday > 0) {
    shipmentsChange = 100
  }

  return { shipmentsToday, shipmentsYesterday, shipmentsChange }
}

import db from '@/lib/db'

export async function getRecentMovements(count = 4) {
  const recentMovements = await db.movement.findMany({
    take: count,
    include: {
      movementDetail: {
        include: { batch: { include: { product: true } } },
      },
      order: {
        include: { customer: true },
      },
      user: true,
      shipment: true,
      discard: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return recentMovements
}

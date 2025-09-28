import db from '@/lib/db'

export async function getRecentMovements(count = 5) {
  const recentMovements = await db.movement.findMany({
    take: count,
    include: {
      order: true,
      movementDetail: {
        include: { batch: { include: { product: true } } },
      },
      user: true,
      shipment: true,
      discard: true,
    },
  })
  return recentMovements
}

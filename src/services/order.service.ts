import db from '@/lib/db'

export async function getPendingOrdersCount(): Promise<number> {
  return db.order.count({
    where: { statusDoing: 'PENDING' },
  })
}

export async function getRecentMovements() {
  return db.movement.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      movementDetail: true,
    },
  })
}

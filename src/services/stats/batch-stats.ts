import db from "@/lib/db";


export async function getTotalBatches(): Promise<number> {
  return db.batch.count();
}

export async function getInventorySummary() {
  return db.batch.aggregate({
    _sum: {
      depositQuantity: true,
      marketQuantity: true,
      sentQuantity: true,
      receivedQuantity: true,
      discardedQuantity: true,
      reservedQuantity: true,
      soltQuantity: true,
      discrepancyQuantity: true,
    },
  });
}

export async function getLowStockBatches(): Promise<number> {
  return db.batch.count({
    where: {
      OR: [
        {
          initialQuantity: { gt: 0 },
          depositQuantity: { lt: 0.1 },
        },
        {
          initialQuantity: 0,
          depositQuantity: 0,
        },
      ],
    },
  });
}


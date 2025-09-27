
import db from "@/lib/db"

export async function getProductionStats() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
  
    const [batchesToday, batchesYesterday] = await Promise.all([
      db.batch.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      db.batch.count({
        where: {
          createdAt: { gte: startOfYesterday, lte: endOfYesterday },
        },
      }),
    ]);
  
    let productionChange = 0;
    if (batchesYesterday > 0) {
      productionChange = ((batchesToday - batchesYesterday) / batchesYesterday) * 100;
    } else if (batchesToday > 0) {
      productionChange = 100;
    }
  
    return { batchesToday, batchesYesterday, productionChange };
  }
  
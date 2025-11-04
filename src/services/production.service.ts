
import db from "@/lib/db"

export async function getProductionStats() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const startOfLastWeek = new Date(lastWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay());
    startOfLastWeek.setHours(0, 0, 0, 0);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);
  
    const [batchesThisWeek, batchesLastWeek] = await Promise.all([
      db.batch.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      db.batch.count({
        where: {
          createdAt: { gte: startOfLastWeek, lte: endOfLastWeek },
        },
      }),
    ]);
  
    let productionChange = 0;
    if (batchesLastWeek > 0) {
      productionChange = ((batchesThisWeek - batchesLastWeek) / batchesLastWeek) * 100;
    } else if (batchesThisWeek > 0) {
      productionChange = 100;
    }
  
    return { batchesThisWeek, batchesLastWeek, productionChange };
  }
  
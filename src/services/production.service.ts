
import db from "@/lib/db"

export async function getProductionStats() {
   const now = new Date() // Hoy: Viernes 21 Noviembre

  // 1. Calcular el inicio de ESTA semana (Lunes 17 Nov 00:00)
  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay() // 5 (Viernes)

  // Si es Domingo (0) restamos 6 días, si no restamos (día - 1)
  const diff = day === 0 ? 6 : day - 1

  // 21 - 4 = 17 (Lunes)
  startOfWeek.setDate(now.getDate() - diff)
  startOfWeek.setHours(0, 0, 0, 0)

  // 2. Calcular la semana PASADA para comparar (Lunes 10 Nov al Domingo 16 Nov)
  // Esto sirve para calcular el porcentaje de crecimiento/caída
  const startOfLastWeek = new Date(startOfWeek)
  startOfLastWeek.setDate(startOfWeek.getDate() - 7) // Lunes 10

  const endOfLastWeek = new Date(startOfWeek)
  endOfLastWeek.setMilliseconds(-1) // Domingo 16 (23:59:59)
  
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
  
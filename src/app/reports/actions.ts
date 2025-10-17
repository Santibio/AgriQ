'use server'

import db from '@/lib/db'

// 1. Definimos la estructura de los datos que devolverá la función
export interface ProductStock {
  name: string
  marketStock: number
  depositStock: number
}

/**
 * Obtiene el stock agregado de productos desde la base de datos.
 * Suma las cantidades de todos los lotes (Batch) para cada producto.
 * @returns Una promesa que resuelve a un array de ProductStock.
 */
export async function getProductStock(): Promise<ProductStock[]> {
  try {
    // 2. Hacemos la consulta a la base de datos
    const productsWithBatches = await db.product.findMany({
      // Filtramos solo los productos activos
      where: {
        active: true,
      },
      // Seleccionamos el nombre del producto e incluimos sus lotes asociados
      select: {
        name: true,
        products: {
          // De cada lote, solo necesitamos estas dos cantidades
          select: {
            marketQuantity: true,
            depositQuantity: true,
          },
        },
      },
    })

    // 3. Procesamos y agregamos los datos para que coincidan con la estructura que necesita el gráfico
    const aggregatedStock = productsWithBatches.map(product => {
      // Usamos 'reduce' para sumar las cantidades de todos los lotes de un producto
      const totalMarketStock = product.products.reduce(
        (sum, batch) => sum + batch.marketQuantity,
        0,
      )
      const totalDepositStock = product.products.reduce(
        (sum, batch) => sum + batch.depositQuantity,
        0,
      )

      return {
        name: product.name,
        marketStock: totalMarketStock,
        depositStock: totalDepositStock,
      }
    })

    // 4. Devolvemos el array con los datos listos para usar en el frontend
    return aggregatedStock
  } catch (error) {
    console.error('Error fetching product stock:', error)
    // En caso de un error, devolvemos un array vacío o podríamos lanzar el error
    return []
  }
}

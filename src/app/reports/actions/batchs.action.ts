'use server'

import db from '@/lib/db'

// 1. Definimos la estructura de datos que devolverá la función
export interface ProductionBatch {
  id: number
  initialQuantity: number
  createdAt: Date
  product: {
    name: string
  }
  user: {
    name: string
    lastName: string
  }
}

/**
 * Obtiene los lotes de producción basados en los movimientos de tipo 'STORED'.
 * Incluye el producto y el usuario que generó el movimiento.
 * @returns Una promesa que resuelve a un array de ProductionBatch.
 */
export async function getProductionBatches(): Promise<ProductionBatch[]> {
  try {
    // 2. Buscamos los movimientos que representan la creación de un lote
    const storedMovements = await db.movement.findMany({
      where: {
        type: 'STORED',
        // Aseguramos que el movimiento tenga detalles asociados
        movementDetail: {
          some: {},
        },
      },
      select: {
        createdAt: true, // La fecha de creación es la del movimiento
        user: {
          // Incluimos el nombre y apellido del usuario creador
          select: {
            name: true,
            lastName: true,
          },
        },
        // Obtenemos el primer detalle del movimiento, que nos llevará al lote
        movementDetail: {
          take: 1, // Asumimos un lote por movimiento de creación
          select: {
            batch: {
              // Del lote, obtenemos la información relevante
              select: {
                id: true,
                initialQuantity: true,
                product: {
                  // Y del producto, solo necesitamos el nombre
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Ordenamos por los más recientes
      },
    })

    // 3. Mapeamos y aplanamos los datos para que sean fáciles de usar en el frontend
    const batches = storedMovements
      .map(movement => {
        // Nos aseguramos de que todos los datos necesarios existan
        const detail = movement.movementDetail[0]
        if (!detail || !detail.batch || !movement.user) {
          return null
        }

        return {
          id: detail.batch.id,
          initialQuantity: detail.batch.initialQuantity,
          createdAt: movement.createdAt,
          product: {
            name: detail.batch.product.name,
          },
          user: {
            name: movement.user.name,
            lastName: movement.user.lastName,
          },
        }
      })
      .filter((batch): batch is ProductionBatch => batch !== null) // Filtramos cualquier resultado nulo

    return batches
  } catch (error) {
    console.error('Error fetching production batches:', error)
    return []
  }
}

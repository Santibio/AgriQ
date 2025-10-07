import AddButton from '@/components/buttons/add-button'
import ListPage from '@/components/layout/list-page'
import db from '@/lib/db'
import Orderslist from './components/orders-list'
import paths from '@/lib/paths'
import {
  Order,
  Movement,
  MovementDetail,
  Batch,
  Product,
  Customer,
  Sale,
} from '@prisma/client'

type OrderWithRelations = Order & {
  movements: (Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product
      }
    })[]
  })[]
  sale: Sale | null
  customer: Customer
  totalProducts?: number
}

// Función para agrupar y sumar cantidades por productoId
const processOrders = (orders: OrderWithRelations[]) => {
  return orders.map(order => {
    // Objeto para acumular cantidades por productoId
    const productTotals: Record<number, number> = {}

    order.movements[0].movementDetail.forEach(detail => {
      const productId = detail.batch.productId
      productTotals[productId] =
        (productTotals[productId] || 0) + detail.quantity

      // Calcular el precio total para este detalle
      detail.batch.product.price = detail.batch.product.price * detail.quantity
    })

    // Agregar el total de productos únicos al objeto de orden
    return {
      ...order,
      totalProducts: Object.keys(productTotals).length,
    }
  })
}

export default async function Orders() {
  const today = new Date()
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0,
  )
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999,
  )

  const currentOrders = await db.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      movements: {
        include: {
          movementDetail: {
            include: {
              batch: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
      sale: true,
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Procesar las órdenes para calcular totales
  const processedOrders = processOrders(currentOrders)

  return (
    <ListPage
      title='Pedidos'
      actions={<AddButton href={paths.orderAdd()}>Crear pedido</AddButton>}
    >
      <Orderslist list={processedOrders} />
    </ListPage>
  )
}

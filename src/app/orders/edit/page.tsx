import db from '@/lib/db'
import OrderForm from '../components/order-form'
import { notFound } from 'next/navigation'
import FormPage from '@/components/layout/form-page'

interface ShipmentEditPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShipmentEditPage({
  searchParams,
}: ShipmentEditPageProps) {
  const orderId = (await searchParams).id as string
  const orderIdInt = parseInt(orderId)

  // 1. Obtener el pedido a editar
  const order = await db.order.findUnique({
    where: { id: orderIdInt },
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
    },
  })

  if (!order) return notFound()

  // 2. Obtener clientes
  const customers = await db.customer.findMany()

  // --- INICIO: Lógica de Productos Disponibles (Optimizada y Ordenada) ---

  // 3. Obtener el stock disponible agrupado por producto
  const batchs = await db.batch.groupBy({
    by: ['productId'],
    where: {
      marketQuantity: {
        gt: 0,
      },
    },
    _sum: {
      marketQuantity: true,
    },
  })

  // 4. Obtener la info de los productos que tienen stock
  const productIds = batchs.map(b => b.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, image: true },
  })

  // 5. (Optimización) Crear un Map para búsqueda rápida O(1)
  const productMap = new Map(products.map(p => [p.id, p]))

  // 6. Mapear stock con info de producto y ORDENAR
  const sortedAvailableProducts = batchs
    .map(b => {
      const product = productMap.get(b.productId)
      return {
        productId: b.productId,
        productName: product?.name || 'Producto no encontrado',
        quantity: b._sum.marketQuantity || 0,
        price: product?.price || 0,
        image: product?.image || '',
      }
    })
    .sort((a, b) => a.productName.localeCompare(b.productName))

  // --- FIN: Lógica de Productos Disponibles ---

  // 7. Preparar los datos iniciales del formulario (el pedido existente)
  const initialData = {
    customerId: order?.customerId || undefined,
    products: Object.values(
      order?.movements[0].movementDetail.reduce(
        (acc, detail) => {
          const productId = detail.batch.productId
          if (!acc[productId]) {
            acc[productId] = {
              productId,
              productName: detail.batch.product.name,
              quantity: 0,
              price: detail.batch.product.price,
              image: detail.batch.product.image,
            }
          }
          acc[productId].quantity += detail.quantity
          return acc
        },
        {} as Record<
          number,
          {
            productId: number
            productName: string
            quantity: number
            price: number
            image: string
          }
        >,
      ),
    ).sort((a, b) => a.productName.localeCompare(b.productName)), // <-- ORDENAMOS también los productos del pedido
  }

  return (
    <FormPage title={`Editar pedido #${orderId}`}>
      <OrderForm
        products={sortedAvailableProducts} // <-- Usamos la variable ordenada
        movementId={order?.movements[0].id}
        orderId={orderIdInt}
        customers={customers}
        initialData={initialData}
      />
    </FormPage>
  )
}

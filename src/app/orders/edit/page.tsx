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

  const customers = await db.customer.findMany()

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

  const productIds = batchs.map(b => b.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, image: true },
  })

  const groupBatchByProduct = batchs.map(b => ({
    productId: b.productId,
    productName: products.find(p => p.id === b.productId)?.name || '',
    quantity: b._sum.marketQuantity || 0,
    price: products.find(p => p.id === b.productId)?.price || 0,
    image: products.find(p => p.id === b.productId)?.image || '',
  }))

  const initialData = {
    customerId: order?.customerId || undefined,
    products: Object.values(
      order?.movements[0].movementDetail.reduce((acc, detail) => {
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
      }, {} as Record<number, { productId: number; productName: string; quantity: number; price: number; image: string }>),
    ),
  }

  return (
    <FormPage title={`Editar pedido #${orderId}`}>
      <OrderForm
        products={groupBatchByProduct}
        movementId={order?.movements[0].id}
        orderId={orderIdInt}
        customers={customers}
        initialData={initialData}
      />
    </FormPage>
  )
}

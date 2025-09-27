import db from '@/lib/db'
import PaymentOrderForm from '../components/payment-order-form'
import { notFound } from 'next/navigation'
import FormPage from '@/components/layout/form-page'

interface ShipmentEditPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PaymentOrderPAge({
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
      customer: true,
    },
  })

  if (!order) return notFound()

  const parsedOrder = {
    id: order.id,
    customer: order?.customer,
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
              subtotal: 0,
            }
          }
          acc[productId].quantity += detail.quantity
          acc[productId].subtotal =
            acc[productId].quantity * acc[productId].price
          return acc
        },
        {} as Record<
          number,
          {
            productId: number
            productName: string
            quantity: number
            price: number
            subtotal: number
          }
        >,
      ),
    ),
    subtotal: 0, // Se calculará después
  }

  // Calcular el subtotal general sumando los subtotales de cada producto
  parsedOrder.subtotal = parsedOrder.products.reduce(
    (sum, product) => sum + product.subtotal,
    0,
  )

  return (
    <FormPage title={`Cobro de Pedido #${order.id}`}>
      <PaymentOrderForm order={parsedOrder} />
    </FormPage>
  )
}

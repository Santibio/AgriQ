import PageTitle from '@/components/page-title'
import db from '@/lib/db'
import { notFound } from 'next/navigation'
import OrderMovements from '../components/order-movements'

interface ShipmentEditPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MovementsOrderPage({
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

  return (
    <section className='flex flex-col justify-between gap-6 px-6'>
      <PageTitle>Movimientos del Pedido #{order.id}</PageTitle>
      <OrderMovements order={order} />
    </section>
  )
}

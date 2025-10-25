import db from '@/lib/db'
import CustomerForm from '../components/shipment-form'
import { notFound } from 'next/navigation'
import FormPage from '@/components/layout/form-page'
import { Location } from '@prisma/client'

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShipmentEditPage({
  params,
  searchParams,
}: ShipmentEditPageProps) {
  const origin = (await searchParams).origin as string

  const isOriginDeposit = origin === Location.DEPOSIT
  // Espera params antes de usar sus propiedades
  const awaitedParams = await params
  const shipmentId = parseInt(awaitedParams.id)

  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      movement: {
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
  if (!shipment) return notFound()

  const batchs = await db.batch.findMany({
    include: {
      product: true,
    },
    where: {
      depositQuantity: {
        gt: 0,
      },
    },
  })

  // Unifica los batchs a editar con los nuevos, sin repetir
  const batchsToEdit = shipment!.movement.movementDetail.map(detail => ({
    ...detail.batch,
    sentQuantity: detail.quantity,
  }))

  const allBatchs = [
    ...batchsToEdit.map(batch => ({ ...batch })),
    ...batchs
      .filter(
        batch => !batchsToEdit.some(editedBatch => editedBatch.id === batch.id),
      )
      .map(batch => ({ ...batch, filtered: true })),
  ]

  const canEdit = shipment?.status === 'PENDING'

  return (
    <FormPage
      title={canEdit ? `Editar envío #${shipmentId}` : `Envío #${shipmentId}`}
    >
      <CustomerForm
        batchs={allBatchs}
        movementId={shipment?.movementId}
        canEdit={canEdit}
        isOriginDeposit={isOriginDeposit}
      />
    </FormPage>
  )
}

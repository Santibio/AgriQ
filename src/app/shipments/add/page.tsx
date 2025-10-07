import React from 'react'
import ShipmentForm from '../components/shipment-form'
import db from '@/lib/db'
import FormPage from '@/components/layout/form-page'
import { Location } from '@prisma/client'

interface ShipmentAddPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShipmentAddPage({
  searchParams,
}: ShipmentAddPageProps) {
  const origin = (await searchParams).origin as string

  const isOriginDeposit = origin === Location.DEPOSIT

  const batchs = await db.batch.findMany({
    include: {
      product: true,
    },
    where: {
      depositQuantity: {
        gt: isOriginDeposit ? 0 : undefined,
      },
      marketQuantity: {
        gt: !isOriginDeposit ? 0 : undefined,
      },
    },
    orderBy: {
      product: {
        name: 'asc',
      },
    },
  })

  return (
    <FormPage title='Crear Envío'>
      <ShipmentForm batchs={batchs} isOriginDeposit={isOriginDeposit} />
    </FormPage>
  )
}

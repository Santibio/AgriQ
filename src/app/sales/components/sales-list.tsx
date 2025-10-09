'use client'

import { Card, CardBody, useDisclosure } from '@heroui/react'
import {
  Sale,
  Order,
  PaymentMethod,
  Customer,
  OrderDetail,
} from '@prisma/client'
import { Landmark, Wallet } from 'lucide-react'
import EmptyListMsg from '@/components/empty-list'
import { timeAgo } from '@/lib/helpers/date'
import { JSX, useState } from 'react'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import SaleDetail from './sale-detail'

export type SaleWithRelations = Sale & {
  order: Order & {
    customer: Customer
    details: OrderDetail[]
    sale: Sale
  }
}

interface SalesListProps {
  sales: SaleWithRelations[]
}

interface SaleCardProps {
  sale: SaleWithRelations
  onSelectSale: (sale: SaleWithRelations) => void
}

interface PaymentMethodInfo {
  label: string
  color: string
  icon: JSX.Element
  bgColor: string
}

const fiscalConditionMap: Record<Customer['fiscalCondition'], string> = {
  RESPONSIBLE: 'Responsable Incripto',
  MONOTAX: 'Monotributista',
  FINAL_CONSUMER: 'Consumidor Final',
  EXEMPT: 'Exento',
}

const paymentMethodMap: Record<PaymentMethod, PaymentMethodInfo> = {
  CASH: {
    label: 'Efectivo',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <Wallet />,
  },
  WIRE: {
    label: 'Transferencia',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Landmark />,
  },
}

function SaleCard({ sale, onSelectSale }: SaleCardProps) {
  return (
    <Card>
      <CardBody onClick={() => onSelectSale(sale)}>
        <div className='flex items-start gap-2'>
          <div
            className={`p-2 rounded-lg ${
              paymentMethodMap[sale.paymentMethod].bgColor
            } ${paymentMethodMap[sale.paymentMethod].color}`}
          >
            {paymentMethodMap[sale.paymentMethod].icon}
          </div>
          <div className='flex justify-between flex-1'>
            <div className='flex flex-col'>
              <h3 className='text-lg font-semibold'>
                {sale.order.customer.name} {sale.order.customer.lastName}
              </h3>
              <span className='text-slate-500 text-sm'>
                {fiscalConditionMap[sale.order.customer.fiscalCondition]}
              </span>
              <div className='mt-2 text-md text-muted-foreground'>
                Total: {convertToArgentinePeso(sale.total)}
              </div>
            </div>
            <span className='text-slate-500 text-sm'>
              {timeAgo(sale.createdAt)}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default function SalesList({ sales }: SalesListProps) {
  const { isOpen, onOpenChange } = useDisclosure()

  const [selectedSale, setSelectedSale] = useState<SaleWithRelations | null>(
    null,
  )

  const handleSelectSale = (sale: SaleWithRelations) => {
    setSelectedSale(sale)
    onOpenChange()
  }

  if (sales.length === 0) {
    return <EmptyListMsg text='No hay ventas registradas' />
  }

  return (
    <>
      <div className='space-y-3'>
        {sales.map(sale => (
          <SaleCard key={sale.id} sale={sale} onSelectSale={handleSelectSale} />
        ))}
      </div>
      <SaleDetail
        sale={selectedSale}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  )
}

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
import { Search } from '@/components/search'

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

  const [filteredList, setFilteredList] = useState(sales)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
    const lowercasedFilter = searchTermValue.toLowerCase()
    const filtered = sales.filter(sale => {
      const userName = sale.order.customer.name.toLowerCase()
      const lastName = sale.order.customer.lastName.toLowerCase()

      return (
        userName.includes(lowercasedFilter) ||
        lastName.includes(lowercasedFilter)
      )
    })
    setFilteredList(filtered)
  }

  const handleSelectSale = (sale: SaleWithRelations) => {
    setSelectedSale(sale)
    onOpenChange()
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        <Search
          placeholder='Buscar por nombre o apellido'
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          className='flex-1'
        />
        <div className='space-y-3'>
          {filteredList.length > 0 ? (
            filteredList.map(sale => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onSelectSale={handleSelectSale}
              />
            ))
          ) : (
            <EmptyListMsg text='No hay ventas disponibles.' />
          )}
        </div>
      </div>
      <SaleDetail
        sale={selectedSale}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  )
}

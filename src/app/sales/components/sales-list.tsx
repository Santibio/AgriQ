'use client'

import {
  Card,
  CardBody,
  useDisclosure,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  RadioGroup,
  Radio,
} from '@heroui/react'
import {
  Sale,
  Order,
  PaymentMethod,
  Customer,
  OrderDetail,
} from '@prisma/client'
import { Landmark, ListFilter, Wallet } from 'lucide-react'
import EmptyListMsg from '@/components/empty-list'
import { timeAgo } from '@/lib/helpers/date'
import { JSX, useMemo, useState } from 'react'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import SaleDetail from './sale-detail'
import { Search } from '@/components/search'
import moment from 'moment'

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

type SortByType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
type DateFilterType = 'all' | '7days' | '30days'
type PaymentMethodFilterType = 'all' | PaymentMethod

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isOpenDetailOrderDrawer, onOpen: onOpenDetailOrderDrawer, onOpenChange: onOpenChangeDetailOrderDrawer } =
    useDisclosure()
  const [selectedSale, setSelectedSale] = useState<SaleWithRelations | null>(
    null,
  )
  const [searchTerm, setSearchTerm] = useState('')

  const [activeSortBy, setActiveSortBy] = useState<SortByType>('date-desc')
  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterType>('all')
  const [activePaymentMethodFilter, setActivePaymentMethodFilter] =
    useState<PaymentMethodFilterType>('all')

  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilterType>(activeDateFilter)
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] =
    useState<PaymentMethodFilterType>(activePaymentMethodFilter)

  const filteredAndSortedSales = useMemo(() => {
    let filtered = [...sales]

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase()
      filtered = filtered.filter(sale => {
        const customerName =
          `${sale.order.customer.name} ${sale.order.customer.lastName}`.toLowerCase()
        return customerName.includes(lowercasedFilter)
      })
    }

    if (activeDateFilter !== 'all') {
      const cutOffDate =
        activeDateFilter === '7days'
          ? moment().subtract(7, 'days')
          : moment().subtract(30, 'days')

      if (cutOffDate) {
        filtered = filtered.filter(s =>
          moment(s.createdAt).isSameOrAfter(cutOffDate),
        )
      }
    }

    if (activePaymentMethodFilter !== 'all') {
      filtered = filtered.filter(
        s => s.paymentMethod === activePaymentMethodFilter,
      )
    }

    switch (activeSortBy) {
      case 'date-desc':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case 'date-asc':
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        break
      case 'amount-desc':
        filtered.sort((a, b) => b.total - a.total)
        break
      case 'amount-asc':
        filtered.sort((a, b) => a.total - b.total)
        break
      default:
        break
    }

    return filtered
  }, [
    sales,
    searchTerm,
    activeSortBy,
    activeDateFilter,
    activePaymentMethodFilter,
  ])

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  const handleSelectSale = (sale: SaleWithRelations) => {
    setSelectedSale(sale)
    onOpenDetailOrderDrawer()
  }

  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedDateFilter(activeDateFilter)
    setSelectedPaymentMethodFilter(activePaymentMethodFilter)
    onOpen()
  }

  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveDateFilter(selectedDateFilter)
    setActivePaymentMethodFilter(selectedPaymentMethodFilter)
    onOpenChange()
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleDateFilterChange = (value: string) => {
    setSelectedDateFilter(value as DateFilterType)
  }

  const handlePaymentMethodFilterChange = (value: string) => {
    setSelectedPaymentMethodFilter(value as PaymentMethodFilterType)
  }

  if (!sales.length) {
    return <EmptyListMsg text='No hay ventas para mostrar.' />
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Search
            placeholder='Buscar por nombre o apellido'
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            className='flex-1'
          />
          <Button
            variant='flat'
            color='primary'
            isIconOnly
            onPress={handleOpenDrawer}
          >
            <ListFilter className='w-5 h-5' />
          </Button>
        </div>
        <div className='space-y-3'>
          {filteredAndSortedSales.length > 0 ? (
            filteredAndSortedSales.map(sale => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onSelectSale={handleSelectSale}
              />
            ))
          ) : (
            <EmptyListMsg text='No se encontraron ventas con esos Búsqueda.' />
          )}
        </div>
      </div>
      <SaleDetail
        sale={selectedSale}
        isOpen={isOpenDetailOrderDrawer}
        onOpenChange={onOpenChangeDetailOrderDrawer}
      />
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop='blur'
        placement='bottom'
        size='2xl'
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>
                  Búsqueda y Ordenamiento
                </h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div className='flex flex-col gap-6'>
                  <RadioGroup
                    label='Ordenar por'
                    value={selectedSortBy}
                    onValueChange={handleSortByChange}
                  >
                    <Radio value='date-desc'>Más recientes</Radio>
                    <Radio value='date-asc'>Más antiguos</Radio>
                    <Radio value='amount-desc'>Mayor importe</Radio>
                    <Radio value='amount-asc'>Menor importe</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Buscar por fecha'
                    value={selectedDateFilter}
                    onValueChange={handleDateFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    <Radio value='7days'>Últimos 7 días</Radio>
                    <Radio value='30days'>Últimos 30 días</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Buscar por método de cobro'
                    value={selectedPaymentMethodFilter}
                    onValueChange={handlePaymentMethodFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    {Object.entries(paymentMethodMap).map(
                      ([key, { label }]) => (
                        <Radio key={key} value={key}>
                          {label}
                        </Radio>
                      ),
                    )}
                  </RadioGroup>
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  color='primary'
                  className='w-full'
                  onPress={handleApplyFilters}
                >
                  Aplicar
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

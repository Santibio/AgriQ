'use client'

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Radio,
  RadioGroup,
  useDisclosure,
} from '@nextui-org/react'
import { CircleX, Clock, ListFilter, ShieldAlert } from 'lucide-react'
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Discard,
} from '@prisma/client'
import { JSX, useMemo, useState } from 'react'
import CardWithShadow from '@/components/card-with-shadow'
import { Search } from '@/components/search'
import EmptyListMsg from '@/components/empty-list'
import { capitalize } from '@/lib/helpers/text'
import { timeAgo } from '@/lib/helpers/date'
import moment from 'moment'

// --- Interfaces y Tipos ---
interface DiscardListProps {
  discards: MovementWithRelations[]
}

type SortByType = 'date-desc' | 'date-asc' | 'quantity-desc' | 'quantity-asc'
type DateFilterType = 'all' | '7days' | '30days'
type ReasonFilterType = 'all' | Discard['reason']

type MovementWithRelations = Movement & {
  movementDetail: (MovementDetail & {
    batch: Batch & {
      product: Product
    }
  })[]
  discard: Discard | null
}

// --- Mapeo de Estilos por Motivo ---
const REASON_MAP: Record<
  Discard['reason'],
  {
    icon: JSX.Element
    background: string
    text: string
    border: string
    label: string
  }
> = {
  EXPIRED: {
    icon: <Clock className='h-5 w-5' />,
    background: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Vencido',
  },
  DAMAGED: {
    icon: <ShieldAlert className='h-5 w-5' />,
    background: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Dañado',
  },
  OTHER: {
    icon: <CircleX className='h-5 w-5' />,
    background: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Otro',
  },
}

// --- Componente con Estilo Mejorado ---
export default function DiscardList({ discards }: DiscardListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  // --- Estado "Activo" (el que filtra la lista) ---
  const [activeSortBy, setActiveSortBy] = useState<SortByType>('date-desc')
  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterType>('all')
  const [activeReasonFilter, setActiveReasonFilter] =
    useState<ReasonFilterType>('all')

  // --- Estado "Seleccionado" (temporal, para el drawer) ---
  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilterType>(activeDateFilter)
  const [selectedReasonFilter, setSelectedReasonFilter] =
    useState<ReasonFilterType>(activeReasonFilter)

  const filteredAndSortedDiscards = useMemo(() => {
    let filtered = [...discards]

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase()
      filtered = filtered.filter(discard => {
        const productName =
          discard.movementDetail[0]?.batch.product.name.toLowerCase()
        return productName.includes(lowercasedFilter)
      })
    }

    if (activeDateFilter !== 'all') {
      const cutOffDate =
        activeDateFilter === '7days'
          ? moment().subtract(7, 'days')
          : moment().subtract(30, 'days')

      if (cutOffDate) {
        filtered = filtered.filter(d =>
          moment(d.createdAt).isSameOrAfter(cutOffDate),
        )
      }
    }

    if (activeReasonFilter !== 'all') {
      filtered = filtered.filter(d => d.discard?.reason === activeReasonFilter)
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
      case 'quantity-desc':
        filtered.sort(
          (a, b) =>
            (b.movementDetail[0]?.quantity || 0) -
            (a.movementDetail[0]?.quantity || 0),
        )
        break
      case 'quantity-asc':
        filtered.sort(
          (a, b) =>
            (a.movementDetail[0]?.quantity || 0) -
            (b.movementDetail[0]?.quantity || 0),
        )
        break
      default:
        break
    }

    return filtered
  }, [discards, searchTerm, activeSortBy, activeDateFilter, activeReasonFilter])

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedDateFilter(activeDateFilter)
    setSelectedReasonFilter(activeReasonFilter)
    onOpen()
  }

  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveDateFilter(selectedDateFilter)
    setActiveReasonFilter(selectedReasonFilter)
    onOpenChange()
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleDateFilterChange = (value: string) => {
    setSelectedDateFilter(value as DateFilterType)
  }

  const handleReasonFilterChange = (value: string) => {
    setSelectedReasonFilter(value as ReasonFilterType)
  }

  if (!discards.length) {
    return <EmptyListMsg text='No hay descartes disponibles.' />
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Search
            placeholder='Buscar por nombre de producto'
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
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
        {filteredAndSortedDiscards?.length > 0 ? (
          filteredAndSortedDiscards.map(movement => {
            const reasonInfo = movement.discard
              ? REASON_MAP[movement.discard.reason]
              : null
            const productInfo = movement.movementDetail[0]?.batch.product
            const quantity = movement.movementDetail[0]?.quantity

            // Si falta información esencial, no se renderiza el elemento
            if (!reasonInfo || !productInfo) return null

            return (
              <CardWithShadow key={`${movement.id} - ${movement.discard?.id}`}>
                <div className='flex'>
                  {/* Icono y acento de color a la izquierda */}
                  <div
                    className={`flex items-center justify-center p-4 ${reasonInfo.background} ${reasonInfo.text}`}
                  >
                    {reasonInfo.icon}
                  </div>

                  {/* Contenido principal */}
                  <div className='flex flex-1 flex-col justify-center p-3'>
                    <div className='flex items-start justify-between'>
                      <h3 className='text-base font-semibold text-slate-800'>
                        {capitalize(productInfo.name)}
                      </h3>
                      <p className='flex-shrink-0 text-xs text-slate-500 ml-4 whitespace-nowrap'>
                        {timeAgo(movement.createdAt)}
                      </p>
                    </div>
                    <div className='mt-2 flex items-center justify-between text-sm'>
                      {/* Badge para el motivo */}
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${reasonInfo.background} ${reasonInfo.text}`}
                      >
                        {reasonInfo.label}
                      </div>
                      {/* Cantidad */}
                      <p className='font-bold text-slate-700'>
                        {quantity}{' '}
                        <span className='font-normal text-slate-500'>
                          unidades
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardWithShadow>
            )
          })
        ) : (
          <EmptyListMsg text='No se encontraron descartes con esos Búsqueda.' />
        )}
      </div>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop='blur'
        placement='bottom'
        size='2xl'
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
                    <Radio value='quantity-desc'>Mayor cantidad</Radio>
                    <Radio value='quantity-asc'>Menor cantidad</Radio>
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
                    label='Buscar por motivo'
                    value={selectedReasonFilter}
                    onValueChange={handleReasonFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    {Object.entries(REASON_MAP).map(([key, { label }]) => (
                      <Radio key={key} value={key}>
                        {label}
                      </Radio>
                    ))}
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

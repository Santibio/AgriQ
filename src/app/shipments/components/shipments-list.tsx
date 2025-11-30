'use client'
import {
  Button,
  CardBody,
  Chip,
  Link,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  RadioGroup,
  Radio,
  useDisclosure,
} from '@heroui/react'
import {
  AlertTriangle,
  ArrowUpLeft,
  CheckCircle2,
  ChevronRight,
  MoveRight,
  Package,
  PackagePlus,
  ListFilter,
} from 'lucide-react'
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Shipment,
  Location,
} from '@prisma/client'
import paths from '@/lib/paths'
import { JSX, useMemo, useState } from 'react'
import { capitalize } from '@/lib/utils'
import EmptyListMsg from '@/components/empty-list'
import { timeAgo } from '@/lib/helpers/date'
import CardWithShadow from '@/components/card-with-shadow'
import { Color } from '@/lib/schemas/general'
import { Search } from '@/components/search'
import moment from 'moment'

// --- Tipos y Mapeos (Mejorados para más claridad) ---

interface ShipmentsListProps {
  shipments: ShipmentWithRelations[]
  canReceiveShipment: boolean
}

type SortByType = 'date-desc' | 'date-asc'
type DateFilterType = 'all' | '7days' | '30days'
type StatusFilterType = 'all' | Shipment['status']

type ShipmentWithRelations = Shipment & {
  // Asumo que origin y destination están en el modelo Shipment
  origin: string
  destination: string
  movement: Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product
      }
    })[]
  }
}

interface ChipProps {
  color: Color
  variant: 'light' | 'flat'
  size: 'sm' | 'md' | 'lg'
  label: string
}

// Colores para los tipos de producto (provisto por ti)
const typeColors: Record<string, Omit<ChipProps, 'label'>> = {
  secas: { color: 'primary', variant: 'flat', size: 'sm' },
  frescas: { color: 'success', variant: 'flat', size: 'sm' },
  deHoja: { color: 'secondary', variant: 'flat', size: 'sm' },
  tuberculosRaices: { color: 'danger', variant: 'flat', size: 'sm' },
  varios: { color: 'warning', variant: 'flat', size: 'sm' },
}
const defaultTypeColor = { color: 'default', variant: 'flat', size: 'sm' }

// Se añade 'label' y 'color' para el Chip del estado
const STATUS_MAP: Record<
  Shipment['status'],
  { icon: JSX.Element; label: string; color: Color }
> = {
  PENDING: {
    // Icono: Un paquete recién creado/sellado. Representa el lote listo para salir.
    // Alternativa: <Send className='h-4 w-4' /> (avión de papel, más orientado al envío).
    icon: <PackagePlus className='h-4 w-4' />,
    label: 'Pendiente a recepción',
    color: 'warning',
  },
  RECEIVED_OK: {
    // Icono: Un círculo con un check. Es el símbolo universal de "completado exitosamente".
    // Más claro y estándar que el doble check.
    icon: <CheckCircle2 className='h-4 w-4' />,
    label: 'Recibido correctamente',
    color: 'success',
  },
  RECEIVED_NO_OK: {
    // Icono: Triángulo de advertencia. Comunica perfectamente "llegó, pero hay un problema".
    // No es un error total (X), sino una alerta que requiere atención.
    icon: <AlertTriangle className='h-4 w-4' />,
    label: 'Recibido con discrepancia',
    color: 'danger',
  },
  RETURNED: {
    // Icono: Flecha de retorno (U-turn). Describe visualmente la acción de volver al origen.
    // Es mucho más preciso que una "X" y diferencia claramente este estado de un error.
    icon: <ArrowUpLeft className='h-4 w-4' />,
    label: 'Devuelto a depósito',
    color: 'default', // Se sugiere un color neutro como 'default' o 'secondary' ya que no es un error.
  },
}

const destinationMap: Record<Location, string> = {
  DEPOSIT: 'Depósito',
  MARKET: 'Mercado',
}

// --- Componente Principal ---

export default function ShipmentsList({
  shipments,
  canReceiveShipment,
}: ShipmentsListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  const [activeSortBy, setActiveSortBy] = useState<SortByType>('date-desc')
  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterType>('all')
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<StatusFilterType>('all')

  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilterType>(activeDateFilter)
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<StatusFilterType>(activeStatusFilter)

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = [...shipments]

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase()
      filtered = filtered.filter(shipment =>
        shipment.id.toString().includes(lowercasedFilter),
      )
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

    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === activeStatusFilter)
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
      default:
        break
    }

    return filtered
  }, [
    shipments,
    searchTerm,
    activeSortBy,
    activeDateFilter,
    activeStatusFilter,
  ])

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedDateFilter(activeDateFilter)
    setSelectedStatusFilter(activeStatusFilter)
    onOpen()
  }

  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveDateFilter(selectedDateFilter)
    setActiveStatusFilter(selectedStatusFilter)
    onOpenChange()
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleDateFilterChange = (value: string) => {
    setSelectedDateFilter(value as DateFilterType)
  }

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatusFilter(value as StatusFilterType)
  }

  // Límite de productos a mostrar antes de agrupar
  const MAX_PRODUCTS_VISIBLE = 3

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Search
            placeholder='Buscar por número de envío'
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
        {canReceiveShipment && (
          <Button
            as={Link}
            color='primary'
            size='sm'
            endContent={<ChevronRight className='h-4 w-4' />}
            variant='flat'
            href={paths.shipmentReception()}
          >
            Recepcionar envíos
          </Button>
        )}
      </div>
      <ul className='flex flex-col gap-4'>
        {filteredAndSortedShipments.length ? (
          filteredAndSortedShipments.map(shipment => {
            const statusInfo = STATUS_MAP[shipment.status]
            const products = shipment.movement.movementDetail
            const visibleProducts = products.slice(0, MAX_PRODUCTS_VISIBLE)
            const hiddenProductsCount = products.length - visibleProducts.length

            return (
              <li key={shipment.id}>
                <Link
                  href={paths.shipmentEdit(shipment.id.toString())}
                  className='w-full'
                >
                  <CardWithShadow isPressable>
                    {/* Usamos flex-col para estructurar la tarjeta en secciones verticales */}
                    <CardBody className='flex flex-col gap-4 p-4'>
                      {/* === SECCIÓN 1: ENCABEZADO (ID y ESTADO) === */}
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='text-lg font-bold text-slate-800'>{`Envío #${shipment.id}`}</h3>
                          <p className='text-xs text-slate-500'>
                            {timeAgo(shipment?.createdAt)}
                          </p>
                        </div>
                        <Chip
                          color={statusInfo.color}
                          variant='solid'
                          size='sm'
                          startContent={statusInfo.icon}
                        >
                          {statusInfo.label}
                        </Chip>
                      </div>

                      {/* === SECCIÓN 2: RUTA (ORIGEN Y DESTINO) - LAYOUT HORIZONTAL === */}
                      <div className='flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 sm:gap-4'>
                        {/* --- Origen --- */}
                        <div className='flex-1'>
                          <p className='truncate text-xs text-slate-500'>
                            Origen
                          </p>
                          <p className='truncate font-medium text-slate-700'>
                            {destinationMap[shipment.origin]}
                          </p>
                        </div>

                        {/* --- Conector Visual --- */}
                        <div className='flex-shrink-0 rounded-full bg-white p-2 shadow-sm'>
                          <MoveRight className='h-5 w-5 text-slate-500' />
                        </div>

                        {/* --- Destino --- */}
                        <div className='flex-1 text-right'>
                          <p className='truncate text-xs text-slate-500'>
                            Destino
                          </p>
                          <p className='truncate font-medium text-slate-700'>
                            {destinationMap[shipment.destination]}
                          </p>
                        </div>
                      </div>

                      {/* === SECCIÓN 3: PRODUCTOS (LISTA INTELIGENTE) === */}
                      <div>
                        <div className='mb-2 flex items-center gap-2'>
                          <Package className='h-4 w-4 text-slate-500' />
                          <h4 className='text-sm font-semibold text-slate-600'>
                            Productos
                          </h4>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {visibleProducts.map(detail => {
                            const product = detail.batch.product
                            // Asigna color por tipo o un color por defecto si no se encuentra
                            const chipStyle =
                              typeColors[product.type] || defaultTypeColor
                            return (
                              <Chip
                                key={detail.id}
                                color={chipStyle.color}
                                variant={chipStyle.variant}
                                size={chipStyle.size}
                              >
                                {`${capitalize(product.name)} x${
                                  detail.quantity
                                }`}
                              </Chip>
                            )
                          })}
                          {hiddenProductsCount > 0 && (
                            <Chip size='sm' color='default' variant='flat'>
                              +{hiddenProductsCount} más...
                            </Chip>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </CardWithShadow>
                </Link>
              </li>
            )
          })
        ) : (
          <EmptyListMsg text='No se encontraron envíos con esos Búsqueda.' />
        )}
      </ul>
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
                    label='Buscar por estado'
                    value={selectedStatusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    {Object.entries(STATUS_MAP).map(([key, { label }]) => (
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
    </div>
  )
}

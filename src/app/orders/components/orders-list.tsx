'use client'
import {
  Button, // Importado
  Card,
  Checkbox, // Importado
  CheckboxGroup, // Importado
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter, // Importado
  DrawerHeader,
  Listbox,
  ListboxItem,
  Radio, // Importado
  RadioGroup, // Importado
  useDisclosure,
} from '@heroui/react'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Eye,
  History,
  ListFilter, // Importado
  PackageCheck,
  PackageOpen,
  Trash,
  Truck,
  XCircle,
} from 'lucide-react'

import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Order,
  Customer,
  StatusDoing,
  StatusPayment,
  Sale,
} from '@prisma/client'
import { JSX, useMemo, useState } from 'react' // Importado useMemo
import EmptyListMsg from '@/components/empty-list'
import { useRouter } from 'next/navigation'
import paths from '@/lib/paths'
import {
  setOrderStatusToCancel,
  setOrderStatusToDelivered,
  setOrderStatusToReady,
} from '../actions'
import { toast } from 'sonner'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import OrderDetail from './order-detail'
import { useLoading } from '@/providers/loading-provider'
import { timeAgo } from '@/lib/helpers/date'
import CancellationModal, { CancellationReason } from './cancel-order-modal'
import { Search } from '@/components/search'
import { removeAccents } from '@/lib/helpers/text'

interface OrderListProps {
  list: OrderWithRelations[]
  canCreateOrder: boolean
}

type OrderWithRelations = Order & {
  movements: (Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product
      }
    })[]
  })[]
  customer: Customer
  sale: Sale | null
  totalUniqueProducts?: number
  totalProducts?: number
}

// ... [LOS OBJETOS STATUS_MAP y STATUS_PAYMENT_MAP SIGUEN IGUAL] ...
const STATUS_MAP: Record<
  Order['statusDoing'],
  {
    icon: JSX.Element
    gradient: string
    label: string
    color: string
    progress: string
  }
> = {
  PENDING: {
    icon: <Clock className='h-6 w-6 text-white' />,
    gradient: 'from-warning to-warning/50',
    label: 'Pendiente de preparar',
    color: 'text-warning',
    progress: '25%',
  },
  READY_TO_DELIVER: {
    icon: <PackageCheck className='h-6 w-6 text-white' />,
    gradient: 'from-primary to-primary/50',
    label: 'Preparado',
    color: 'text-primary',
    progress: '75%',
  },
  DELIVERED: {
    icon: <Truck className='h-6 w-6 text-white' />,
    gradient: 'from-success to-success/50',
    label: 'Entregado',
    color: 'text-success',
    progress: '100%',
  },
  CANCELLED: {
    icon: <XCircle className='h-6 w-6 text-white' />,
    gradient: 'from-danger to-danger/50',
    label: 'Cancelado', // Label añadido para el filtro
    color: 'text-danger',
    progress: '5%',
  },
}

const STATUS_PAYMENT_MAP: Record<
  Order['statusPayment'],
  {
    icon: JSX.Element
    className: string
    label: string
  }
> = {
  UNPAID: {
    icon: <AlertCircle className='h-4 w-4' />,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Pendiente de pago',
  },
  PAID: {
    icon: <CheckCircle2 className='h-4 w-4' />,
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Pagado',
  },
  CANCELLED: {
    icon: <XCircle className='h-4 w-4' />,
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Cancelado',
  },
  PARCIAL_PAID: {
    icon: <PackageCheck className='h-4 w-4' />,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Pago parcial',
  },
}
// ... [LA FUNCION getAvailableActions SIGUE IGUAL] ...
const getAvailableActions = (
  order: Order,
  router: ReturnType<typeof useRouter>,
  handlers: {
    handleStatusDoing: () => void
    handleStatusPedingToDeliver: () => void
    handleOpenDetailOrderDrawer: () => void
    handleOpenCancelModal: () => void
  },
  canCreateOrder: boolean,
) => {
  const actions = [
    {
      key: 'view_details',
      label: 'Detalle del pedido',
      icon: <Eye />,
      onPress: () => handlers.handleOpenDetailOrderDrawer(),
      isVisible: true,
    },
    {
      key: 'view_movements',
      label: 'Movimientos del pedido',
      icon: <History />,
      onPress: () => router.push(paths.orderToMovements(order.id.toString())),
      isVisible: true,
    },
    {
      key: 'edit',
      label: 'Editar pedido',
      icon: <Edit />,
      onPress: () => router.push(paths.orderToEdit(order.id.toString())),
      isVisible:
        order?.statusPayment === StatusPayment.UNPAID && canCreateOrder,
    },
    {
      key: 'charge',
      label: 'Cobrar pedido',
      icon: <DollarSign />,
      onPress: () => router.push(paths.orderToCharge(order.id.toString())),
      isVisible:
        order?.statusPayment === StatusPayment.UNPAID && canCreateOrder,
    },
    {
      key: 'prepare',
      label: 'Preparar pedido',
      icon: <PackageOpen />,
      onPress: handlers.handleStatusDoing,
      isVisible:
        order?.statusDoing === StatusDoing.PENDING &&
        order.statusPayment !== StatusPayment.CANCELLED &&
        canCreateOrder,
    },
    {
      key: 'deliver',
      label: 'Entregar pedido',
      icon: <PackageOpen />,
      onPress: handlers.handleStatusPedingToDeliver,
      isVisible:
        order?.statusDoing === StatusDoing.READY_TO_DELIVER &&
        order?.statusPayment === StatusPayment.PAID &&
        canCreateOrder,
    },

    {
      key: 'cancel',
      label: <span className='text-red-500'>Cancelar pedido</span>,
      icon: <Trash className='text-red-500' />,
      onPress: handlers.handleOpenCancelModal,
      isVisible:
        order?.statusDoing !== StatusDoing.DELIVERED &&
        order?.statusPayment !== StatusPayment.CANCELLED &&
        canCreateOrder,
    },
  ]

  return actions.filter(action => action.isVisible)
}

// --- Nuevos Tipos para Filtros y Orden ---
type SortByType =
  | 'date-desc'
  | 'date-asc'
  | 'total-desc'
  | 'total-asc'
  | 'name-asc'
  | 'name-desc'

export default function OrderList({ list, canCreateOrder }: OrderListProps) {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()

  // Disclosures para drawers/modals existentes
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const {
    isOpen: isCancelModalOpen,
    onOpen: onOpenCancelModal,
    onOpenChange: onOpenChangeCancelModal,
  } = useDisclosure()
  const {
    isOpen: isOpenDetailOrderDrawer,
    onOpen: onOpenDetailOrderDrawer,
    onOpenChange: onOpenChangeDetailOrderDrawer,
  } = useDisclosure()

  // --- Nuevo Disclosure para el Drawer de Filtros ---
  const {
    isOpen: isFilterOpen,
    onOpen: onOpenFilter,
    onOpenChange: onOpenChangeFilter,
  } = useDisclosure()

  // Estados para la selección de items
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(
    null,
  )
  const [productsList, setProductsList] = useState<
    Array<{
      productId: number
      productName: string
      quantity: number
      price: number
      selectedQuantity: number
      image?: string
    }>
  >([])

  // --- Estado para Búsqueda (en vivo) ---
  const [searchTerm, setSearchTerm] = useState('')

  // --- Estado "Activo" (el que filtra la lista) ---
  const [activeSortBy, setActiveSortBy] = useState<SortByType>('date-desc')
  const [activeStatusDoing, setActiveStatusDoing] = useState<StatusDoing[]>([])
  const [activeStatusPayment, setActiveStatusPayment] = useState<
    StatusPayment[]
  >([])

  // --- Estado "Seleccionado" (temporal, para el drawer de filtros) ---
  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedStatusDoing, setSelectedStatusDoing] =
    useState<StatusDoing[]>(activeStatusDoing)
  const [selectedStatusPayment, setSelectedStatusPayment] =
    useState<StatusPayment[]>(activeStatusPayment)

  // --- Lógica de Filtro y Orden con useMemo ---
  const filteredAndSortedList = useMemo(() => {
    let filtered = [...list]

    // 1. Aplicar Filtro de Búsqueda (en vivo)
    if (searchTerm) {
      const lowercasedFilter = removeAccents(searchTerm).toLowerCase()
      filtered = filtered.filter(order => {
        const lotNumber = order.id.toString()
        const customerName = removeAccents(order.customer.name).toLowerCase()
        const customerLastName = removeAccents(
          order.customer.lastName,
        ).toLowerCase()
        const fullName = `${customerName} ${customerLastName}`

        return (
          lotNumber.includes(lowercasedFilter) ||
          customerName.includes(lowercasedFilter) ||
          customerLastName.includes(lowercasedFilter) ||
          fullName.includes(lowercasedFilter)
        )
      })
    }

    // 2. Aplicar Filtro de Estado de Pedido (on apply)
    if (activeStatusDoing.length > 0) {
      filtered = filtered.filter(order =>
        activeStatusDoing.includes(order.statusDoing),
      )
    }

    // 3. Aplicar Filtro de Estado de Pago (on apply)
    if (activeStatusPayment.length > 0) {
      filtered = filtered.filter(order =>
        activeStatusPayment.includes(order.statusPayment),
      )
    }

    // 4. Aplicar Ordenamiento (on apply)
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
      case 'total-desc':
        filtered.sort((a, b) => b.total - a.total)
        break
      case 'total-asc':
        filtered.sort((a, b) => a.total - b.total)
        break
      case 'name-asc':
        filtered.sort((a, b) =>
          `${a.customer.name} ${a.customer.lastName}`.localeCompare(
            `${b.customer.name} ${b.customer.lastName}`,
          ),
        )
        break
      case 'name-desc':
        filtered.sort((a, b) =>
          `${b.customer.name} ${b.customer.lastName}`.localeCompare(
            `${a.customer.name} ${a.customer.lastName}`,
          ),
        )
        break
    }

    return filtered
  }, [list, searchTerm, activeSortBy, activeStatusDoing, activeStatusPayment])
  // --- Fin useMemo ---

  // El handle de búsqueda ahora solo actualiza el término
  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  // --- Handlers para el Drawer de Filtros ---
  const handleOpenFilterDrawer = () => {
    // Sincroniza el estado "seleccionado" con el "activo"
    setSelectedSortBy(activeSortBy)
    setSelectedStatusDoing(activeStatusDoing)
    setSelectedStatusPayment(activeStatusPayment)
    onOpenFilter()
  }

  const handleApplyFilters = () => {
    // Aplica el estado "seleccionado" al "activo" y cierra
    setActiveSortBy(selectedSortBy)
    setActiveStatusDoing(selectedStatusDoing)
    setActiveStatusPayment(selectedStatusPayment)
    onOpenChangeFilter()
  }
  // --- Fin Handlers Filtros ---

  const handleOpenDetailOrderDrawer = () => {
    onOpenDetailOrderDrawer()
    onOpenChange()
  }

  const handleSelectOrder = (order: OrderWithRelations) => {
    setSelectedOrder(order)
    // ... (resto de la lógica de handleSelectOrder)
    const products = order.movements[0].movementDetail.map(detail => ({
      productId: detail.batch.product.id,
      productName: detail.batch.product.name, // Assuming 'name' exists on Product
      quantity: detail.quantity,
      price: detail.batch.product.price / detail.quantity, // Assuming 'price' exists on Product
      selectedQuantity: detail.quantity, // Initialize selected quantity
      image: detail.batch.product.image, // Assuming 'image' exists on Product
    }))
    setProductsList(products)
    onOpen()
  }

  // ... [HANDLERS: handleStatusDoing, handleStatusPedingToDeliver, handleStatusPedingToCancel, handleOpenCancelModal SIGUEN IGUAL] ...
  const handleStatusDoing = async () => {
    showLoading()
    onOpenChange()
    try {
      const response = await setOrderStatusToReady(selectedOrder!.id)

      if (response?.errors) {
        return toast.error('Ocurrió un error al procesar la solicitud.')
      }

      toast.success('Pedido preparada correctamente')
    } catch (error) {
      console.error('Error: ', error)
      toast.error(
        'Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe.',
      )
    } finally {
      onOpenChange()
      hideLoading()
    }
  }
  const handleStatusPedingToDeliver = async () => {
    showLoading()
    onOpenChange()
    try {
      const response = await setOrderStatusToDelivered(selectedOrder!.id)

      if (response?.errors) {
        return toast.error('Ocurrió un error al procesar la solicitud.')
      }

      toast.success('Pedido entregada correctamente')
    } catch (error) {
      console.error('Error: ', error)
      toast.error(
        'Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe.',
      )
    } finally {
      hideLoading()
    }
  }

  const handleStatusPedingToCancel = async (reason: CancellationReason) => {
    showLoading()
    onOpenChange()
    try {
      const response = await setOrderStatusToCancel(selectedOrder!.id, reason)

      if (response?.errors) {
        toast.error('Ocurrió un error al procesar la solicitud.')
        return
      }
      const message =
        selectedOrder?.statusDoing === 'PENDING'
          ? 'Pedido cancelado correctamente'
          : `Pedido cancelado correctamente.\nRecorda desarmar el pedido` // TODO: agregar salto de linea

      toast.success(message)
    } catch (error) {
      toast.error(
        'Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe.',
      )
    } finally {
      hideLoading()
      onOpenChangeCancelModal()
    }
  }

  const handleOpenCancelModal = () => {
    onOpenCancelModal()
  }
  return (
    <>
      <div className='flex flex-col gap-2'>
        {/* --- Contenedor para Búsqueda y Filtro --- */}
        <div className='flex gap-2'>
          <Search
            placeholder='Buscar por número de pedido o nombre cliente'
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            className='flex-1'
          />
          {/* --- Botón de Filtro --- */}
          <Button
            variant='flat'
            color='primary'
            isIconOnly
            onPress={handleOpenFilterDrawer}
          >
            <ListFilter className='w-5 h-5' />
          </Button>
        </div>

        <ul className='flex gap-2 flex-col  w-full'>
          {/* --- Usar la lista memoizada --- */}
          {filteredAndSortedList.length ? (
            filteredAndSortedList.map(order => {
              const statusDoingKey = order.statusDoing
              return (
                <li key={order.id}>
                  <Card
                    isPressable
                    onPress={() => handleSelectOrder(order)}
                    className='w-full p-4 border'
                    shadow='sm'
                  >
                    {/* ... [CONTENIDO DEL CARD SIGUE IGUAL] ... */}
                    <div className='flex gap-4 items-start'>
                      <div
                        className={`w-14 h-14 min-w-[3.5rem] rounded-lg bg-gradient-to-r ${STATUS_MAP?.[statusDoingKey]?.gradient} flex items-center justify-center text-white text-xl shadow-sm`}
                      >
                        {STATUS_MAP[statusDoingKey]?.icon}
                      </div>

                      <div className='flex-1'>
                        <div className='flex justify-between items-start'>
                          <div className='flex items-start flex-col'>
                            <span className='font-semibold text-medium'>
                              Pedido #{order.id}
                            </span>
                            <span className='text-sm text-gray-600'>
                              {`${order.customer.name} ${order.customer.lastName}`}
                            </span>
                          </div>
                          <div className='flex items-end flex-col'>
                            <span className='text-xs text-gray-500'>
                              {timeAgo(order?.createdAt)}
                            </span>
                            {order.sale && order.sale.discount > 0 ? (
                              <div className='flex flex-col items-end'>
                                <span className='text-xs text-gray-400 line-through'>
                                  {convertToArgentinePeso(order.total)}
                                </span>
                                <span className='text-sm font-semibold text-success'>
                                  {convertToArgentinePeso(order.sale.total)}
                                </span>
                              </div>
                            ) : (
                              <span className='text-sm font-semibold text-gray-900'>
                                {convertToArgentinePeso(order.total)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='flex justify-between mt-2 items-end'>
                          <div className='flex flex-col gap-2'>
                            <span
                              className={`${STATUS_MAP?.[statusDoingKey]?.color} text-xs font-semibold text-start`}
                            >
                              {STATUS_MAP?.[statusDoingKey]?.label}
                            </span>
                            <Chip
                              size='sm'
                              radius='sm'
                              variant='flat'
                              startContent={
                                STATUS_PAYMENT_MAP?.[order?.statusPayment]?.icon
                              }
                              className={
                                STATUS_PAYMENT_MAP?.[order?.statusPayment]
                                  ?.className
                              }
                            >
                              {
                                STATUS_PAYMENT_MAP?.[order?.statusPayment]
                                  ?.label
                              }
                            </Chip>
                          </div>
                          <div className='text-right'>
                            <p className='text-xs text-gray-500'>
                              {order.totalProducts}{' '}
                              {order.totalProducts === 1
                                ? 'producto'
                                : 'productos'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Progress Indicator */}
                    <div className='py-2 mt-4'>
                      <div className='w-full bg-gray-200 rounded-full h-1.5'>
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${STATUS_MAP?.[statusDoingKey]?.gradient} transition-all duration-500`}
                          style={{
                            width:
                              STATUS_MAP?.[statusDoingKey]?.progress || '0%',
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              )
            })
          ) : (
            <EmptyListMsg text='No hay pedidos pendientes' />
          )}
        </ul>
      </div>

      {/* --- [DRAWER DE ACCIONES (EXISTENTE) SIGUE IGUAL] --- */}
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop='blur'
        placement='bottom'
        size='xl'
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>
                  Pedido #{selectedOrder?.id}
                </h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div>
                  <Listbox>
                    {getAvailableActions(
                      selectedOrder!,
                      router,
                      {
                        handleStatusDoing,
                        handleStatusPedingToDeliver,
                        handleOpenDetailOrderDrawer,
                        handleOpenCancelModal,
                      },
                      canCreateOrder,
                    ).map(action => (
                      <ListboxItem
                        key={action.key}
                        startContent={action.icon}
                        onPress={action.onPress}
                      >
                        {action.label}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* --- NUEVO DRAWER DE FILTROS Y ORDENAMIENTO --- */}
      <Drawer
        isOpen={isFilterOpen}
        onOpenChange={onOpenChangeFilter}
        backdrop='blur'
        placement='bottom'
        size='3xl'
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>
                  Filtros y Ordenamiento
                </h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div className='flex flex-col gap-6'>
                  {/* --- Grupo de Ordenamiento --- */}
                  <RadioGroup
                    label='Ordenar por'
                    value={selectedSortBy}
                    onValueChange={v => setSelectedSortBy(v as SortByType)}
                  >
                    <Radio value='date-desc'>Más recientes</Radio>
                    <Radio value='date-asc'>Más antiguos</Radio>
                    <Radio value='total-desc'>Mayor total</Radio>
                    <Radio value='total-asc'>Menor total</Radio>
                    <Radio value='name-asc'>Cliente (A-Z)</Radio>
                    <Radio value='name-desc'>Cliente (Z-A)</Radio>
                  </RadioGroup>

                  {/* --- Filtro Estado de Pedido --- */}
                  <CheckboxGroup
                    label='Filtrar por estado'
                    value={selectedStatusDoing}
                    onValueChange={v =>
                      setSelectedStatusDoing(v as StatusDoing[])
                    }
                  >
                    <Checkbox value={StatusDoing.PENDING}>
                      Pendiente de preparar
                    </Checkbox>
                    <Checkbox value={StatusDoing.READY_TO_DELIVER}>
                      Preparado
                    </Checkbox>
                    <Checkbox value={StatusDoing.DELIVERED}>Entregado</Checkbox>
                    <Checkbox value={StatusDoing.CANCELLED}>Cancelado</Checkbox>
                  </CheckboxGroup>

                  {/* --- Filtro Estado de Pago --- */}
                  <CheckboxGroup
                    label='Filtrar por pago'
                    value={selectedStatusPayment}
                    onChange={v =>
                      setSelectedStatusPayment(
                        v.map(item => item as StatusPayment),
                      )
                    }
                  >
                    <Checkbox value={StatusPayment.UNPAID}>
                      Pendiente de pago
                    </Checkbox>
                    <Checkbox value={StatusPayment.PAID}>Pagado</Checkbox>
                    <Checkbox value={StatusPayment.CANCELLED}>
                      Cancelado
                    </Checkbox>
                  </CheckboxGroup>
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
      {/* --- FIN NUEVO DRAWER --- */}

      {/* --- [DRAWER/MODAL EXISTENTES SIGUEN IGUAL] --- */}
      {selectedOrder && (
        <OrderDetail
          productsList={productsList}
          isOpen={isOpenDetailOrderDrawer}
          onOpenChange={onOpenChangeDetailOrderDrawer}
          total={
            selectedOrder.sale ? selectedOrder.sale.total : selectedOrder.total
          }
          discount={selectedOrder.sale?.discount}
        />
      )}
      {selectedOrder && (
        <CancellationModal
          isOpen={isCancelModalOpen}
          onClose={onOpenChangeCancelModal}
          onConfirm={handleStatusPedingToCancel}
          orderId={selectedOrder?.id}
        />
      )}
    </>
  )
}

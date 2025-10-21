'use client'
import {
  Card,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Listbox,
  ListboxItem,
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
import { JSX, useState } from 'react'
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

interface OrderListProps {
  list: OrderWithRelations[]
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
    label: '',
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

const getAvailableActions = (
  order: Order,
  router: ReturnType<typeof useRouter>,
  handlers: {
    handleStatusDoing: () => void
    handleStatusPedingToDeliver: () => void
    handleOpenDetailOrderDrawer: () => void
    handleOpenCancelModal: () => void
  },
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
      isVisible: order?.statusPayment === StatusPayment.UNPAID,
    },
    {
      key: 'charge',
      label: 'Cobrar pedido',
      icon: <DollarSign />,
      onPress: () => router.push(paths.orderToCharge(order.id.toString())),
      isVisible: order?.statusPayment === StatusPayment.UNPAID,
    },
    {
      key: 'prepare',
      label: 'Preparar pedido',
      icon: <PackageOpen />,
      onPress: handlers.handleStatusDoing,
      isVisible:
        order?.statusDoing === StatusDoing.PENDING &&
        order.statusPayment !== StatusPayment.CANCELLED,
    },
    {
      key: 'deliver',
      label: 'Entregar pedido',
      icon: <PackageOpen />,
      onPress: handlers.handleStatusPedingToDeliver,
      isVisible:
        order?.statusDoing === StatusDoing.READY_TO_DELIVER &&
        order?.statusPayment === StatusPayment.PAID,
    },

    {
      key: 'cancel',
      label: <span className='text-red-500'>Cancelar pedido</span>,
      icon: <Trash className='text-red-500' />,
      onPress: handlers.handleOpenCancelModal,
      isVisible:
        order?.statusDoing !== StatusDoing.DELIVERED &&
        order?.statusPayment !== StatusPayment.CANCELLED,
    },
  ]

  return actions.filter(action => action.isVisible)
}

export default function OrderList({ list }: OrderListProps) {
  const router = useRouter()
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

  const { showLoading, hideLoading } = useLoading()

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

  const [filteredList, setFilteredList] = useState(list)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
    const lowercasedFilter = searchTermValue.toLowerCase()
    const filtered = list.filter(order => {
      const lotNumber = order.id.toString()
      const customerName = order.customer.name.toLowerCase()
      const customerLastName = order.customer.lastName.toLowerCase()

      return (
        lotNumber.includes(lowercasedFilter) ||
        customerName.includes(lowercasedFilter) ||
        customerLastName.includes(lowercasedFilter)
      )
    })
    setFilteredList(filtered)
  }

  const handleOpenDetailOrderDrawer = () => {
    onOpenDetailOrderDrawer()
    onOpenChange()
  }

  const handleSelectOrder = (order: OrderWithRelations) => {
    setSelectedOrder(order)

    // Transform the data to match the expected type
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
        <Search
          placeholder='Buscar por número de envío o nombre cliente'
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          className='flex-1'
        />

        <ul className='flex gap-2 flex-col  w-full'>
          {filteredList.length ? (
            filteredList.map(order => {
              const statusDoingKey = order.statusDoing
              return (
                <li key={order.id}>
                  <Card
                    isPressable
                    onPress={() => handleSelectOrder(order)}
                    className='w-full p-4 border'
                    shadow='sm'
                  >
                    <div className='flex gap-4 items-start'>
                      {/* Icono con fondo gradiente */}
                      <div
                        className={`w-14 h-14 min-w-[3.5rem] rounded-lg bg-gradient-to-r ${STATUS_MAP?.[statusDoingKey]?.gradient} flex items-center justify-center text-white text-xl shadow-sm`}
                      >
                        {STATUS_MAP[statusDoingKey]?.icon}
                      </div>

                      {/* Contenido */}
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
            <EmptyListMsg text='No hay envíos pendientes' />
          )}
        </ul>
      </div>

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
                    {getAvailableActions(selectedOrder!, router, {
                      handleStatusDoing,
                      handleStatusPedingToDeliver,
                      handleOpenDetailOrderDrawer,
                      handleOpenCancelModal,
                    }).map(action => (
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

import { capitalize } from '@/lib/utils'
import { CardBody, Chip } from '@heroui/react'
import type {
  Batch,
  Discard,
  MovementDetail,
  Order,
  Movement,
  Product,
  Shipment,
  User,
  Customer,
} from '@prisma/client'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  RotateCcw,
  Truck,
  Edit,
  Check,
  PackageCheck,
  XCircle,
  Trash,
} from 'lucide-react'
import { JSX, ReactNode } from 'react'
import { timeAgo } from '@/lib/helpers/date'
import CardWithShadow from './card-with-shadow'

interface ParsedMovement {
  id: number
  title: string
  description: ReactNode
  time: string
  status: MovementStats[keyof MovementStats]
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  bgColor: string
  userName: string
}

type MovementDetailWithRelations = MovementDetail & {
  batch: Batch & {
    product: Product
  }
}

type MovementWithRelations = Movement & {
  order:
    | (Order & {
        customer: Customer
      })
    | null
  movementDetail: MovementDetailWithRelations[]
  user: User
  shipment: Shipment | null
  discard: Discard | null
}

interface MovementStats {
  [key: string]: {
    color: string
    icon: JSX.Element
    label: string
  }
}

interface MovementTypeMap {
  [key: string]: {
    title: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    color: string
    description?: (movement: MovementWithRelations) => ReactNode
    status: MovementStats[keyof MovementStats]
    bgColor: string
  }
}

const reasonMap: Record<Discard['reason'], string> = {
  EXPIRED: 'Vencido',
  DAMAGED: 'Dañado',
  OTHER: 'Otro',
}

const movementStatusMap: MovementStats = {
  completed: {
    color: 'bg-green-500 text-white',
    icon: <CheckCircle className='w-3 h-3' />,
    label: 'Completado',
  },
  warning: {
    color: 'bg-red-500 text-white',
    icon: <AlertCircle className='w-3 h-3' />,
    label: 'Atención',
  },
  'in-transit': {
    color: 'bg-slate-100',
    icon: <Clock className='w-3 h-3' />,
    label: 'En transito',
  },
}
// Map movement types to UI elements
const movementTypeMap: MovementTypeMap = {
  STORED: {
    title: 'Lote creado',
    icon: Package,
    color: 'text-green-600',
    description: movement => {
      const totalQuantity = movement.movementDetail[0].quantity
      const productName = movement.movementDetail[0].batch.product.name
      return (
        <span>
          {capitalize(productName)} - {totalQuantity} unidades
        </span>
      )
    },
    status: movementStatusMap.completed,
    bgColor: 'bg-green-100',
  },
  SENT: {
    title: 'Envío',
    icon: Truck,
    color: 'text-blue-600',
    status: movementStatusMap['in-transit'],
    bgColor: 'bg-blue-100',
    description: movement => {
      const totalQuantity = movement.movementDetail.reduce(
        (acc, detail) => acc + detail.quantity,
        0,
      )
      const totalProducts = movement.movementDetail.length
      return (
        <span>
          {totalProducts === 1 ? 'Un lote' : `${totalProducts} productos`} -{' '}
          {totalQuantity} unidades
        </span>
      )
    },
  },
  RECEIVED_MARKET: {
    title: 'Recibido en Mercado',
    icon: Check,
    color: 'text-green-600',
    status: movementStatusMap.completed,
    bgColor: 'bg-green-100',
    description: movement => {
      const shipmentId = movement.shipment?.id
      return <span>Envio #{shipmentId}</span>
    },
  },
  DISCARDED: {
    title: 'Producto Descartado',
    icon: Trash,
    color: 'text-red-600',
    status: movementStatusMap.warning,
    bgColor: 'bg-red-100',
    description: movement => {
      const discard = movement.discard
      const movementDetail = movement.movementDetail[0]
      const batch = movementDetail.batch
      const product = batch.product
      return (
        <div className='flex gap-1'>
          <span>
            {movementDetail.quantity} de {capitalize(product.name)}
          </span>
          <span className='text-slate-500'>-</span>
          <span className='text-sm text-danger'>
            {reasonMap[discard?.reason || 'OTHER']}
          </span>
        </div>
      )
    },
  },
  ORDERED: {
    title: 'Pedido generado',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    status: movementStatusMap['in-transit'],
    description: movement => {
      const customerName = `${movement.order?.customer.name} ${movement.order?.customer.lastName}`
      return <span>Cliente: {customerName}</span>
    },
  },
  READY_TO_DELIVER: {
    title: 'Listo para Entregar',
    icon: PackageCheck,
    color: 'text-blue-600',
    status: movementStatusMap['in-transit'],
    bgColor: 'bg-blue-100',
    description: movement => {
      const customerName = `${movement.order?.customer.name} ${movement.order?.customer.lastName}`
      return <span>Cliente: {customerName}</span>
    },
  },
  SOLD: {
    title: 'Venta realizada',
    icon: DollarSign,
    color: 'text-green-600',
    status: movementStatusMap.completed,
    bgColor: 'bg-green-100',
    description: movement => {
      const customerName = `${movement.order?.customer.name} ${movement.order?.customer.lastName}`
      return <span>Cliente: {customerName}</span>
    },
  },
  DELIVERED: {
    title: 'Pedido Entregado',
    icon: CheckCircle,
    color: 'text-green-600',
    status: movementStatusMap.completed,
    bgColor: 'bg-green-100',
    description: movement => {
      const customerName = `${movement.order?.customer.name} ${movement.order?.customer.lastName}`
      return <span>Cliente: {customerName}</span>
    },
  },
  CANCELLED: {
    title: 'Pedido Cancelado',
    icon: XCircle,
    color: 'text-red-600',
    status: movementStatusMap.warning,
    bgColor: 'bg-red-100',
    description: movement => {
      const customerName = `${movement.order?.customer.name} ${movement.order?.customer.lastName}`
      return <span>Cliente: {customerName}</span>
    },
  },
  EDITED: {
    title: 'Lote editado',
    icon: Edit,
    color: 'text-yellow-600',
    status: movementStatusMap.completed,
    bgColor: 'bg-yellow-100',
    description: movement => {
      const productName = `${movement?.movementDetail[0].batch.product.name}`
      const newQuantity = movement.movementDetail[0].quantity
      return (
        <span>
          {capitalize(productName)} - Nueva cantidad: {newQuantity}
        </span>
      )
    },
  },
  RETURNED: {
    title: 'Devolución',
    icon: RotateCcw,
    color: 'text-orange-600',
    status: movementStatusMap.warning,
    bgColor: 'bg-orange-100',
  }
}

const parseRecentMovements = (
  movements: MovementWithRelations[],
): ParsedMovement[] => {
  return movements.map(movement => {
    const movementType = movement.type as keyof typeof movementTypeMap
    const typeConfig = movementTypeMap[movementType]

    const description = movementTypeMap[movement.type].description?.(movement)
    const userName = `${movement.user.name} ${movement.user.lastName}`

    return {
      id: movement.id,
      title: typeConfig.title,
      description,
      time: capitalize(timeAgo(movement.createdAt as Date)),
      status: typeConfig.status,
      icon: typeConfig.icon,
      color: typeConfig.color,
      bgColor: typeConfig.bgColor,
      userName,
    }
  })
}
export default function MovementList({
  movements,
}: {
  movements: MovementWithRelations[]
}) {
  const parsedMovements = parseRecentMovements(movements)

  return (
    <div className='space-y-3'>
      {parsedMovements.map(movement => (
        <CardWithShadow key={movement.id}>
          <CardBody className='p-4'>
            <div className='flex items-start space-x-3'>
              <div className={`p-2 rounded-lg ${movement.bgColor}`}>
                <movement.icon className={`h-5 w-5 ${movement.color}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium text-gray-900 truncate'>
                    {movement.title}
                  </h4>
                  <Chip
                    size='sm'
                    className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs ${movement.status.color} `}
                    startContent={movement.status.icon}
                  >
                    {movement.status.label}
                  </Chip>
                </div>
                <p className='text-sm text-gray-600'>{movement.description}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  {movement.time} por {movement.userName}
                </p>
              </div>
            </div>
          </CardBody>
        </CardWithShadow>
      ))}
    </div>
  )
}

import { CardBody } from '@heroui/react'
import {
  CircleUser,
  DollarSign,
  Package,
  ShoppingCart,
  Trash2Icon,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import paths from '@/lib/paths'
import CardWithShadow from './card-with-shadow'

const quickActions = [
  {
    title: 'Producción',
    description: 'Gestión de producción',
    icon: Package,
    color: 'bg-orange-500',
    gradient: 'from-orange-400 to-orange-600',
    link: paths.production(),
  },
  {
    title: 'Descartes',
    description: 'Gestión de descartes',
    icon: Trash2Icon,
    color: 'bg-teal-500',
    gradient: 'from-red-400 to-red-600',
    link: paths.discard(),
  },
  {
    title: 'Envíos',
    description: 'Seguimiento de envíos',
    icon: Truck,
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    link: paths.shipments(),
  },
  {
    title: 'Pedidos',
    description: 'Gestión de pedidos',
    icon: ShoppingCart,
    color: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-yellow-600',
    link: paths.orders(),
  },
  {
    title: 'Clientes',
    description: 'Gestión de clientes',
    icon: CircleUser,
    color: 'bg-teal-500',
    gradient: 'from-teal-400 to-teal-600',
    link: paths.customers(),
  },

  {
    title: 'Ventas',
    description: 'Administración de ventas',
    icon: DollarSign,
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    link: paths.sales(),
  },
]

const QuickActions = () => {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900'>Acciones Rápidas</h3>
      <div className='grid grid-cols-2 gap-4'>
        {quickActions.map((action, index) => (
          <Link href={action.link || '#'} key={index}>
            <CardWithShadow key={index} isPressable>
              <CardBody className='p-4'>
                <div className='space-y-3'>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center `}
                  >
                    <action.icon className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>
                      {action.title}
                    </h4>
                    <p className='text-sm text-gray-600'>
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </CardWithShadow>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

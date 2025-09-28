import { Card, CardBody } from '@heroui/react'
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react'
import getStats from '@/services/stats.service'

interface StatCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
}

import { convertToArgentinePeso } from '@/lib/helpers/number'

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <Card className='bg-white/70 backdrop-blur-sm border-white/20'>
      <CardBody className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm text-gray-600'>{title}</p>
            <p className='text-2xl font-bold text-gray-900'>{value}</p>
          </div>
          <div className='flex items-center space-x-2'>
            <div
              className={`flex items-center space-x-1 ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUpRight className='h-4 w-4' />
              ) : (
                <ArrowDownRight className='h-4 w-4' />
              )}
              <span className='text-sm font-medium'>{change}</span>
            </div>
            <div className='p-2 bg-gray-100 rounded-lg'>
              <Icon className='h-5 w-5 text-gray-600' />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default async function StatsCards() {
  const stats = await getStats()

  const statsData: StatCardProps[] = [
    {
      title: 'Producción de hoy',
      value: `${stats.productionStats.batchesToday} Lote${
        stats.productionStats.batchesToday === 1 ? '' : 's'
      }`,
      change: `${
        stats.productionStats.productionChange >= 0 ? '+' : ''
      }${Math.round(stats.productionStats.productionChange)}%`,
      trend: stats.productionStats.productionChange >= 0 ? 'up' : 'down',
      icon: TrendingUp,
    },
    {
      title: 'Pedidos de la semana',
      value: `${stats.ordersStats.ordersThisWeek}`,
      change: `${stats.ordersStats.ordersChange >= 0 ? '+' : ''}${Math.round(
        stats.ordersStats.ordersChange,
      )}%`,
      trend: stats.ordersStats.ordersChange >= 0 ? 'up' : 'down',
      icon: Package,
    },

    {
      title: 'Ventas del mes',
      value: `${convertToArgentinePeso(stats.salesStats.monthlySales)}`,
      change: `${stats.salesStats.salesChange >= 0 ? '+' : ''}${Math.round(
        stats.salesStats.salesChange,
      )}%`,
      trend: stats.salesStats.salesChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
  ]
  // {
  //   title: 'Envíos pendientes',
  //   value: `${stats.shipmentsStats.shipmentsToday}`,
  //   change: `${
  //     stats.shipmentsStats.shipmentsChange >= 0 ? '+' : ''
  //   }${Math.round(stats.shipmentsStats.shipmentsChange)}%`,
  //   trend: stats.shipmentsStats.shipmentsChange >= 0 ? 'up' : 'down',
  //   icon: Truck,
  // },

  return (
    <div className='flex flex-col gap-4'>
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import { CardBody, Chip, Button } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { RefreshCw } from 'lucide-react'

// --- Importación dinámica de ApexCharts (solo se carga en el cliente) ---
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// --- Interfaces y Datos de Ejemplo (sin cambios) ---
interface Sale {
  clientName: string
  quantitySold: number
  price: number
  saleDate: Date
}

const mockSales: Sale[] = [
  {
    clientName: 'Supermercado Vea',
    quantitySold: 50,
    price: 5.5,
    saleDate: new Date(),
  },
  {
    clientName: 'Verdulería Don Pepe',
    quantitySold: 30,
    price: 3.0,
    saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    clientName: 'Distribuidora del Sur',
    quantitySold: 80,
    price: 2.5,
    saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    clientName: 'Restaurante La Casona',
    quantitySold: 5,
    price: 4.0,
    saleDate: new Date(),
  },
  {
    clientName: 'Almacén de Barrio',
    quantitySold: 10,
    price: 1.8,
    saleDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    clientName: 'Distribuidora del Sur',
    quantitySold: 500,
    price: 1.5,
    saleDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
]

type TimeFilter = 'week' | 'month' | 'year'
type MetricFilter = 'price' | 'quantity'
type SortOrder = 'top' | 'bottom'

interface ChartSlice {
  name: string
  value: number
  color: string
}

export default function ClientDonutDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('year')
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('price')
  const [sortOrder, setSortOrder] = useState<SortOrder>('top')

  const formatCurrency = (value: number) =>
    `$${new Intl.NumberFormat('es-AR').format(value)}`

  // --- Lógica de datos (sin cambios, sigue siendo robusta) ---
  const { chartData } = useMemo(() => {
    // ... (misma lógica de filtrado y agregación)
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000
    const salesInPeriod = mockSales.filter(sale => {
      const diffInDays = Math.floor(
        (now.getTime() - sale.saleDate.getTime()) / oneDayInMillis,
      )
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false
      return true
    })
    const aggregated = salesInPeriod.reduce((acc, sale) => {
      if (!acc[sale.clientName]) {
        acc[sale.clientName] = { totalQuantity: 0, totalPrice: 0 }
      }
      acc[sale.clientName].totalQuantity += sale.quantitySold
      acc[sale.clientName].totalPrice += sale.quantitySold * sale.price
      return acc
    }, {} as Record<string, { totalQuantity: number; totalPrice: number }>)
    const fullSortedList = Object.entries(aggregated)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const valueA = metricFilter === 'price' ? a.totalPrice : a.totalQuantity
        const valueB = metricFilter === 'price' ? b.totalPrice : b.totalQuantity
        return sortOrder === 'top' ? valueB - valueA : valueA - valueB
      })
    const top3 = fullSortedList.slice(0, 3)
    const others = fullSortedList.slice(3)
    const chartData: ChartSlice[] = top3.map((client, i) => ({
      name: client.name,
      value:
        metricFilter === 'price' ? client.totalPrice : client.totalQuantity,
      color: ['#6366F1', '#10B981', '#F59E0B'][i],
    }))
    if (others.length > 0) {
      const othersValue = others.reduce(
        (sum, client) =>
          sum +
          (metricFilter === 'price' ? client.totalPrice : client.totalQuantity),
        0,
      )
      chartData.push({ name: 'Otros', value: othersValue, color: '#6b7280' })
    }
    return { chartData }
  }, [timeFilter, metricFilter, sortOrder])

  // --- Configuración de ApexCharts ---
  const [options, setOptions] = useState<ApexOptions>({})
  const [series, setSeries] = useState<number[]>([])

  useEffect(() => {
    setSeries(chartData.map(d => d.value))
    setOptions({
      chart: { type: 'donut', sparkline: { enabled: true } }, // Sparkline es ideal aquí
      plotOptions: { pie: { donut: { size: '75%' } } },
      labels: chartData.map(d => d.name),
      colors: chartData.map(d => d.color),
      stroke: { width: 4, colors: ['#fff'] },
      legend: { show: false }, // Se construye una leyenda personalizada
      dataLabels: { enabled: false },
    })
  }, [chartData])

  return (
    <CardWithShadow>
      <CardBody className='p-4 md:p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold text-slate-800'>
            {sortOrder === 'top' ? 'Top 3' : 'Bottom 3'} Clientes
          </h3>
          <Button
            size='sm'
            variant='flat'
            onClick={() =>
              setSortOrder(prev => (prev === 'top' ? 'bottom' : 'top'))
            }
            startContent={<RefreshCw size={14} />}
          >
            Ver {sortOrder === 'top' ? 'Menos' : 'Más'}
          </Button>
        </div>
        <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full text-sm mb-4'>
          <Chip
            onClick={() => setMetricFilter('price')}
            variant={metricFilter === 'price' ? 'solid' : 'flat'}
            className='cursor-pointer flex-1 justify-center'
          >
            Por Dinero
          </Chip>
          <Chip
            onClick={() => setMetricFilter('quantity')}
            variant={metricFilter === 'quantity' ? 'solid' : 'flat'}
            className='cursor-pointer flex-1 justify-center'
          >
            Por Cantidad
          </Chip>
        </div>

        {/* --- ✨ Contenedor Principal para Gráfico y Leyenda --- */}
        <div className='flex items-center gap-6'>
          {/* Contenedor del Gráfico */}
          <div className='w-1/2 flex-shrink-0'>
            <Chart
              options={options}
              series={series}
              type='donut'
              height={180}
            />
          </div>
          {/* Contenedor de la Leyenda Personalizada */}
          <div className='w-1/2 flex-grow space-y-2'>
            {chartData.map(slice => (
              <div key={slice.name} className='flex items-center'>
                <span
                  className='w-3 h-3 rounded-full mr-2'
                  style={{ backgroundColor: slice.color }}
                ></span>
                <div className='flex justify-between w-full text-sm'>
                  <span className='text-slate-600'>{slice.name}</span>
                  <span className='font-bold text-slate-800'>
                    {metricFilter === 'price'
                      ? formatCurrency(slice.value)
                      : `${Math.round(slice.value)} u.`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </CardWithShadow>
  )
}

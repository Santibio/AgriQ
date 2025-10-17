'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ApexOptions } from 'apexcharts'
import { Loader2, AlertCircle, Download } from 'lucide-react'
import {
  getOrderStatusStatsForToday,
  OrderStatusStat,
} from '../actions/order.action'

// --- Componente Wrapper para ApexCharts (reutilizado) ---
const ApexChart = ({
  options,
  series,
  type,
  width,
  height,
}: {
  options: ApexOptions
  series: ApexAxisChartSeries | ApexNonAxisChartSeries
  type: string
  width: string
  height: string
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (
      !document.querySelector(
        'script[src="https://cdn.jsdelivr.net/npm/apexcharts"]',
      )
    ) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/apexcharts'
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (
      isLoaded &&
      chartRef.current &&
      typeof window.ApexCharts !== 'undefined'
    ) {
      const chart = new window.ApexCharts(chartRef.current, {
        ...options,
        series,
        chart: { ...options.chart, type, width, height },
      })
      chart.render()
      return () => chart.destroy()
    }
  }, [options, series, type, width, height, isLoaded])

  if (!isLoaded)
    return (
      <div className='h-full w-full flex items-center justify-center'>
        <Loader2 className='w-6 h-6 animate-spin text-slate-400' />
      </div>
    )

  return <div ref={chartRef} />
}

interface SelectedSlice {
  status: string
  count: number
  color: string
}

export default function OrderStatusDonut() {
  const [data, setData] = useState<OrderStatusStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlice, setSelectedSlice] = useState<SelectedSlice | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setSelectedSlice(null)
      try {
        const result = await getOrderStatusStatsForToday()
        setData(result)
      } catch (e) {
        setError('No se pudieron cargar los datos de pedidos.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // Array vacío para que se ejecute solo una vez

  const { totalOrders, series, options } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const chartSeries = data.map(item => item.count)
    const chartOptions: ApexOptions = {
      chart: {
        type: 'donut',
        height: 250,
        events: {
          dataPointSelection: (_, __, config) => {
            const index = config.dataPointIndex
            if (data[index]) setSelectedSlice(data[index])
          },
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: `Total Pedidos`,
                fontSize: '14px',
                color: '#6b7280',
                formatter: () => `${total}`,
              },
              value: { show: true },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      labels: data.map(item => item.status),
      colors: data.map(item => item.color),
      legend: { show: false },
      stroke: { width: 4, colors: ['#fff'] },
    }
    return { totalOrders: total, series: chartSeries, options: chartOptions }
  }, [data])

  const handleCsvExport = () => {
    if (isDownloading || data.length === 0) return
    setIsDownloading(true)

    const headers = ['Estado', 'Cantidad de Pedidos']
    const rows = data.map(item => `"${item.status}",${item.count}`)
    const csvContent = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `estado_pedidos_hoy_${date}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='h-60 flex flex-col items-center justify-center'>
          <Loader2 className='w-8 h-8 text-slate-400 animate-spin' />
        </div>
      )
    }
    if (error) {
      return (
        <div className='h-60 flex flex-col items-center justify-center text-red-600'>
          <AlertCircle className='w-8 h-8 mb-2' />
          <p className='font-semibold'>Error al cargar</p>
        </div>
      )
    }
    if (data.length === 0) {
      return (
        <div className='h-60 flex items-center justify-center'>
          <p className='text-slate-500'>No hay pedidos en el día de hoy.</p>
        </div>
      )
    }
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4 mt-4'>
        <div className='h-48 flex items-center justify-center cursor-pointer'>
          <ApexChart
            options={options}
            series={series}
            type='donut'
            width='100%'
            height='100%'
          />
        </div>
        <div className='w-full space-y-3'>
          {data.map(item => (
            <div
              key={item.status}
              onClick={() => setSelectedSlice(item)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                selectedSlice?.status === item.status
                  ? 'bg-slate-100 scale-105'
                  : ''
              }`}
            >
              <div className='flex items-center gap-3'>
                <span
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className='text-slate-600 font-medium'>
                  {item.status}
                </span>
              </div>
              <span className='font-bold text-slate-800'>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-slate-200'>
      <div className='p-4 md:p-6'>
        <div className='flex justify-between items-center mb-1'>
          <h3 className='text-lg font-semibold text-slate-800'>
            Estado de cobro de Pedidos
          </h3>
          <button
            onClick={handleCsvExport}
            disabled={isDownloading || loading || data.length === 0}
            className='p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDownloading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Download className='w-4 h-4 text-slate-500' />
            )}
          </button>
        </div>
        <p className='text-sm text-slate-500 mb-3'>
          Resumen de los pedidos del día.
        </p>
        {renderContent()}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ApexOptions } from 'apexcharts'
import { Loader2, AlertCircle, Download } from 'lucide-react'
import {
  getOrderCancellationStats,
  CancellationReasonStat,
  TimeFilter,
} from '../actions/cancelation.action'
import CardWithShadow from '@/components/card-with-shadow'
import { Button } from '@heroui/react'

// --- Componente Wrapper para ApexCharts ---
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

export default function OrderCancellationDonut() {
  const [data, setData] = useState<CancellationReasonStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [selectedSlice, setSelectedSlice] =
    useState<CancellationReasonStat | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setSelectedSlice(null)
      try {
        const result = await getOrderCancellationStats(timeFilter)
        setData(result)
      } catch (e) {
        setError('No se pudieron cargar los datos del gráfico.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeFilter])

  const totalCancellations = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0)
  }, [data])

  const { series, options } = useMemo(() => {
    const chartSeries = data.map(item => item.count)
    const chartOptions: ApexOptions = {
      chart: {
        type: 'donut',
        height: 250,
        events: {
          dataPointSelection: (_, __, config) => {
            const index = config.dataPointIndex
            if (data[index]) {
              setSelectedSlice(data[index])
            }
          },
        },
      },
      plotOptions: {
        pie: {
          offsetY: 0,
          donut: {
            size: '75%',
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: `Total`,
                fontSize: '14px',
                color: '#6b7280',
              },
              value: { show: true },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      labels: data.map(item => item.reason),
      colors: data.map(item => item.color),
      legend: { show: false },
      stroke: { width: 3 },
    }
    return { series: chartSeries, options: chartOptions }
  }, [data, totalCancellations])

  const handleCsvExport = () => {
    if (isDownloading || data.length === 0) return
    setIsDownloading(true)

    const headers = ['Motivo de Cancelación', 'Cantidad']
    const rows = data.map(item => `"${item.reason}",${item.count}`)
    const csvContent = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    const date = new Date().toISOString().split('T')[0]
    link.setAttribute(
      'download',
      `motivos_cancelacion_${timeFilter}_${date}.csv`,
    )

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const renderChartAndLegend = () => {
    if (loading) {
      return (
        <div className='h-48 flex flex-col items-center justify-center'>
          <Loader2 className='w-8 h-8 text-slate-400 animate-spin' />
        </div>
      )
    }
    if (error) {
      return (
        <div className='h-48 flex flex-col items-center justify-center text-red-600'>
          <AlertCircle className='w-8 h-8 mb-2' />
          <p className='font-semibold'>Error al cargar</p>
        </div>
      )
    }
    if (data.length === 0) {
      return (
        <div className='h-48 flex items-center justify-center'>
          <p className='text-slate-500'>
            No hay cancelaciones en este período.
          </p>
        </div>
      )
    }
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-center'>
        <div className='relative h-40 flex items-center justify-center cursor-pointer'>
          <ApexChart
            options={options}
            series={series}
            type='donut'
            width='100%'
            height='100%'
          />
        </div>
        <div className='w-full flex flex-col gap-2'>
          {data.map(item => (
            <div
              key={item.reason}
              onClick={() => setSelectedSlice(item)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                selectedSlice?.reason === item.reason
                  ? 'bg-slate-100 scale-105'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className='flex items-center gap-3'>
                <span
                  className='w-1 h-5 rounded-sm'
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className='text-slate-600 font-medium'>
                  {item.reason}
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
    <CardWithShadow>
      <div className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-lg font-semibold text-slate-800'>
            Motivos de Cancelación
          </h3>
          <Button
            onPress={handleCsvExport}
            isDisabled={isDownloading || loading || data.length === 0}
            isLoading={isDownloading}
            isIconOnly
            size='sm'
            variant='light'
          >
            <Download className='w-4 h-4 text-slate-600' />
          </Button>
        </div>
        <div className='flex items-center mb-4 gap-2'>
          <Button
            onPress={() => setTimeFilter('month')}
            size='sm'
            className={`transition-colors flex-1 ${
              timeFilter === 'month'
                ? 'bg-slate-800 text-white'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            Mes
          </Button>
          <Button
            onPress={() => setTimeFilter('quarter')}
            size='sm'
            className={`transition-colors flex-1 ${
              timeFilter === 'quarter'
                ? 'bg-slate-800 text-white'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            3 Meses
          </Button>
          <Button
            onPress={() => setTimeFilter('half')}
            size='sm'
            className={`transition-colors flex-1 ${
              timeFilter === 'half'
                ? 'bg-slate-800 text-white'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            6 Meses
          </Button>
          <Button
            onPress={() => setTimeFilter('year')}
            size='sm'
            className={`transition-colors flex-1 ${
              timeFilter === 'year'
                ? 'bg-slate-800 text-white'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            Año
          </Button>
        </div>
        {renderChartAndLegend()}
      </div>
    </CardWithShadow>
  )
}

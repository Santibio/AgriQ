'use client'

import { useState, useEffect, useRef } from 'react'
import { ApexOptions } from 'apexcharts'
import {
  ArrowUp,
  ArrowDown,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  getSalesChartData,
  SalesChartData,
  TimePeriod,
} from '../actions/sale.action'

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

export default function SalesChart() {
  const [data, setData] = useState<SalesChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today') // Inicia en 'Hoy'
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getSalesChartData(timePeriod)
        console.log("🚀 ~ fetchData ~ result:", result)
        setData(result)
      } catch (e) {
        setError('No se pudo cargar el gráfico de ventas.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timePeriod])

  const formatCurrency = (value: number) =>
    `$${new Intl.NumberFormat('es-AR').format(value)}`
  const formatTotal = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return formatCurrency(value)
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { width: 3, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.1 } },
    tooltip: {
      theme: 'dark',
      y: { formatter: value => formatCurrency(value) },
    },
    colors: ['#3b82f6'],
    xaxis: { categories: data?.categories || [] },
  }

  const handleCsvExport = () => {
    if (isDownloading || !data || data.series.length === 0) return
    setIsDownloading(true)

    const headers = ['Período', 'Ventas']
    const rows = data.categories.map(
      (cat, index) => `"${cat}",${data.series[index]}`,
    )
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    link.setAttribute(`download`, `reporte_ventas_${timePeriod}_${date}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const getSubtitle = () => {
    switch (timePeriod) {
      case 'today':
        return 'Ventas del día de hoy'
      case '7d':
        return 'Ventas en los últimos 7 días'
      case '30d':
        return 'Ventas en los últimos 30 días'
      case '90d':
        return 'Ventas en los últimos 90 días'
      default:
        return 'Ventas'
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='h-[280px] flex items-center justify-center'>
          <Loader2 className='w-8 h-8 text-slate-400 animate-spin' />
        </div>
      )
    }
    if (error || !data) {
      return (
        <div className='h-[280px] flex flex-col items-center justify-center text-red-500'>
          <AlertCircle className='w-8 h-8 mb-2' />
          <p className='font-semibold'>Error al cargar datos</p>
        </div>
      )
    }

    const { totalSales, percentageChange, series } = data
    const isPositive = percentageChange >= 0

    return (
      <>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='leading-none text-4xl font-bold pb-1 text-slate-800'>
              {formatTotal(totalSales)}
            </h3>
            <p className='text-base font-normal text-slate-500'>
              {getSubtitle()}
            </p>
          </div>
          <div
            className={`flex items-center text-base font-semibold px-2 py-1 rounded-md ${
              isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {percentageChange.toFixed(1)}%
            {isPositive ? (
              <ArrowUp className='w-4 h-4 ms-1' />
            ) : (
              <ArrowDown className='w-4 h-4 ms-1' />
            )}
          </div>
        </div>

        <div className='h-48 mt-4'>
          <ApexChart
            options={chartOptions}
            series={[{ data: series }]}
            type='area'
            width='100%'
            height='100%'
          />
        </div>

        <div className='flex justify-between items-center border-t border-slate-200 pt-4 mt-4'>
          <div className='flex gap-1 flex-wrap'>
            <button
              onClick={() => setTimePeriod('today')}
              className={`px-3 py-1 text-sm rounded-full ${
                timePeriod === 'today'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimePeriod('7d')}
              className={`px-3 py-1 text-sm rounded-full ${
                timePeriod === '7d'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimePeriod('30d')}
              className={`px-3 py-1 text-sm rounded-full ${
                timePeriod === '30d'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimePeriod('90d')}
              className={`px-3 py-1 text-sm rounded-full ${
                timePeriod === '90d'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              90D
            </button>
          </div>
          <button
            onClick={handleCsvExport}
            disabled={isDownloading || loading || data.series.length === 0}
            className='p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDownloading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Download className='w-4 h-4 text-slate-500' />
            )}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-slate-200'>
      <div className='p-4 md:p-6'>{renderContent()}</div>
    </div>
  )
}

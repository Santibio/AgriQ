'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ApexOptions } from 'apexcharts'
import { Download, Loader2, AlertCircle } from 'lucide-react'
import {
  getClientSalesRanking,
  ClientSaleRank,
  TimeFilter,
  MetricFilter,
} from '../actions/customers.action'

// --- Componente Wrapper para ApexCharts (reutilizado) ---
const ApexChart = ({
  options,
  series,
  type,
  height,
}: {
  options: ApexOptions
  series: any
  type: any
  height: any
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
        chart: { ...options.chart, type, height },
      })
      chart.render()
      return () => chart.destroy()
    }
  }, [options, series, type, height, isLoaded])
  if (!isLoaded)
    return (
      <div className='h-full w-full flex items-center justify-center'>
        <Loader2 className='w-6 h-6 animate-spin text-slate-400' />
      </div>
    )
  return <div ref={chartRef} />
}

interface ChartSlice {
  name: string
  value: number
  color: string
}

export default function ClientDonutDashboard() {
  const [data, setData] = useState<ClientSaleRank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('year')
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('price')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getClientSalesRanking({
          timeFilter,
          metricFilter,
          sortOrder: 'top', // Siempre pedimos el Top
        })
        setData(result)
      } catch (e) {
        setError('No se pudo cargar el ranking de clientes.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeFilter, metricFilter]) // Se elimina sortOrder de las dependencias

  const formatCurrency = (value: number) =>
    `$${new Intl.NumberFormat('es-AR').format(value)}`

  const chartData = useMemo((): ChartSlice[] => {
    const top3 = data.slice(0, 3)
    const others = data.slice(3)
    const chartSlices: ChartSlice[] = top3.map((client, i) => ({
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
      chartSlices.push({ name: 'Otros', value: othersValue, color: '#6b7280' })
    }
    return chartSlices
  }, [data, metricFilter])

  const chartOptions: ApexOptions = {
    chart: { type: 'donut', sparkline: { enabled: true } },
    plotOptions: { pie: { donut: { size: '75%' } } },
    labels: chartData.map(d => d.name),
    colors: chartData.map(d => d.color),
    stroke: { width: 4, colors: ['#fff'] },
    legend: { show: false },
    dataLabels: { enabled: false },
  }

  const handleCsvExport = () => {
    if (isDownloading || chartData.length === 0) return
    setIsDownloading(true)

    const headers = [
      'Cliente',
      `Valor (${metricFilter === 'price' ? 'ARS' : 'Unidades'})`,
    ]
    const rows = chartData.map(item => `"${item.name}",${item.value}`)

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `top_clientes_${timeFilter}_${date}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setIsDownloading(false), 1000)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='h-[240px] flex items-center justify-center'>
          <Loader2 className='w-8 h-8 text-slate-400 animate-spin' />
        </div>
      )
    }
    if (error) {
      return (
        <div className='h-[240px] flex flex-col items-center justify-center text-red-600'>
          <AlertCircle className='w-8 h-8 mb-2' />
          <p className='font-semibold'>Error al cargar</p>
        </div>
      )
    }
    if (chartData.length === 0) {
      return (
        <div className='h-[240px] flex items-center justify-center'>
          <p className='text-slate-500'>No hay ventas en este período.</p>
        </div>
      )
    }
    return (
      <div className='flex items-center gap-6 mt-4'>
        <div className='w-1/2 flex-shrink-0'>
          <ApexChart
            options={chartOptions}
            series={chartData.map(d => d.value)}
            type='donut'
            height={180}
          />
        </div>
        <div className='w-1/2 flex-grow space-y-2'>
          {chartData.map(slice => (
            <div key={slice.name} className='flex items-center'>
              <span
                className='w-3 h-3 rounded-full mr-2'
                style={{ backgroundColor: slice.color }}
              />
              <div className='flex justify-between w-full text-sm'>
                <span className='text-slate-600 truncate pr-2'>
                  {slice.name}
                </span>
                <span className='font-bold text-slate-800 whitespace-nowrap'>
                  {metricFilter === 'price'
                    ? formatCurrency(slice.value)
                    : `${Math.round(slice.value)} u.`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-slate-200'>
      <div className='p-4 md:p-6'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h3 className='text-lg font-bold text-slate-800'>Top 3 Clientes</h3>
            <p className='text-xs text-slate-400'>
              Por {metricFilter === 'price' ? 'Facturación' : 'Cantidad'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleCsvExport}
              disabled={isDownloading || loading || chartData.length === 0}
              className='p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isDownloading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Download className='w-4 h-4 text-slate-500' />
              )}
            </button>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full text-sm'>
            <button
              onClick={() => setTimeFilter('week')}
              className={`w-full justify-center px-2 py-1 text-sm rounded-full ${
                timeFilter === 'week'
                  ? 'bg-white shadow'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`w-full justify-center px-2 py-1 text-sm rounded-full ${
                timeFilter === 'month'
                  ? 'bg-white shadow'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setTimeFilter('year')}
              className={`w-full justify-center px-2 py-1 text-sm rounded-full ${
                timeFilter === 'year'
                  ? 'bg-white shadow'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Año
            </button>
          </div>
          <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full text-sm'>
            <button
              onClick={() => setMetricFilter('price')}
              className={`w-full justify-center px-2 py-1 text-sm rounded-full ${
                metricFilter === 'price'
                  ? 'bg-white shadow'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Facturación
            </button>
            <button
              onClick={() => setMetricFilter('quantity')}
              className={`w-full justify-center px-2 py-1 text-sm rounded-full ${
                metricFilter === 'quantity'
                  ? 'bg-white shadow'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Cantidad
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

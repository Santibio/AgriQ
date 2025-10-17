'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ApexOptions } from 'apexcharts'
import { Loader2, AlertCircle, Download } from 'lucide-react'
import {
  getDiscardReasonStats,
  DiscardReasonStat,
  TimeFilter,
} from '../actions'

// --- Componente Wrapper para ApexCharts ---
// Carga la librería desde un CDN y renderiza el gráfico manualmente para evitar errores de compilación.
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
    // Carga el script de ApexCharts si aún no está presente
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

      // Limpia el gráfico al desmontar el componente para evitar fugas de memoria
      return () => {
        chart.destroy()
      }
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
  reason: string
  count: number
  color: string
}

export default function DiscardReasonSemiDonut() {
  const [data, setData] = useState<DiscardReasonStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [selectedSlice, setSelectedSlice] = useState<SelectedSlice | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setSelectedSlice(null)
      try {
        const result = await getDiscardReasonStats(timeFilter)
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

  // Calcula el total para usarlo en el JSX y en el gráfico
  const totalDiscards = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0)
  }, [data])

  const { series, options } = useMemo(() => {
    const chartSeries = data.map(item => item.count)
    const chartOptions: ApexOptions = {
      chart: {
        type: 'donut',
        height: 200,
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
          startAngle: -90,
          endAngle: 90,
          offsetY: 0,
          donut: {
            size: '80%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: false },
              total: {
                show: false, // Ocultamos el total del centro para dar espacio
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      labels: data.map(item => item.reason),
      colors: data.map(item => item.color),
      legend: { show: false },
      stroke: { width: 0 },
    }
    return { series: chartSeries, options: chartOptions }
  }, [data])

  const handleCsvExport = () => {
    if (isDownloading || data.length === 0) return
    setIsDownloading(true)

    const headers = ['Motivo', 'Cantidad Descartada']
    const rows = data.map(item => `"${item.reason}",${item.count}`)
    const csvContent = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    const date = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `motivos_descarte_${timeFilter}_${date}.csv`)

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
          <p className='text-sm text-center'>{error}</p>
        </div>
      )
    }
    if (data.length === 0) {
      return (
        <div className='h-48 flex items-center justify-center'>
          <p className='text-slate-500'>
            No hay datos para el período seleccionado.
          </p>
        </div>
      )
    }
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4 mt-4'>
        {/* Gráfico */}
        <div className='relative h-40 flex items-center justify-center cursor-pointer'>
          <ApexChart
            options={options}
            series={series}
            type='donut'
            width='100%'
            height='100%'
          />
        </div>
        {/* Leyenda */}
        <div className='w-full space-y-3'>
          {data.map(item => (
            <div
              key={item.reason}
              onClick={() => setSelectedSlice(item)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                selectedSlice?.reason === item.reason
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
                  {item.reason}
                </span>
              </div>
              <span className='font-bold text-slate-800'>{item.count} u.</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-slate-200'>
      <div className='p-4 md:p-6 overflow-hidden'>
        <div className='flex justify-between items-center mb-1'>
          <h3 className='text-lg font-semibold text-slate-800'>
            Motivos de Descarte
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

        {/* --- Sección de Total --- */}
        <div className='my-4 p-4 bg-slate-50 rounded-lg'>
          <p className='text-sm text-slate-600 font-medium'>
            Total descartado en período
          </p>
          {loading ? (
            <div className='h-8 w-24 bg-slate-200 rounded-md animate-pulse mt-1'></div>
          ) : (
            <p className='text-3xl font-bold text-red-600'>
              {totalDiscards}{' '}
              <span className='text-lg font-medium text-slate-500'>
                unidades
              </span>
            </p>
          )}
        </div>

        <div className='flex gap-2 mb-3 flex-wrap'>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFilter === 'month'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeFilter('quarter')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFilter === 'quarter'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            3 Meses
          </button>
          <button
            onClick={() => setTimeFilter('half')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFilter === 'half'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            6 Meses
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFilter === 'year'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Año
          </button>
        </div>
        {renderChartAndLegend()}
      </div>
    </div>
  )
}

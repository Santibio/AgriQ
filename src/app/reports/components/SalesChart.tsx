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
import CardWithShadow from '@/components/card-with-shadow'
import { Button } from '@heroui/react'
import { convertToArgentinePeso } from '@/lib/helpers/number'

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

  const formatTotal = (value: number) => {
    return convertToArgentinePeso(value)
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
      y: { formatter: value => convertToArgentinePeso(value) },
    },
    colors: ['#3b82f6'],
    xaxis: { categories: data?.categories || [] },
  }

  const handleCsvExport = () => {
    if (isDownloading || !data || data.series.length === 0) return
    setIsDownloading(true)

    try {
      // Obtener todos los datos de ventas (sin límite)
      const allSales = data.categories.map((category, index) => ({
        periodo: category,
        ventas: data.series[index],
        // Agregar más datos si están disponibles en el objeto data
        ...(data.products && { producto: data.products[index] }),
        // Agregar más campos según sea necesario
      }))

      // Crear encabezados del CSV
      const headers = ['Período', 'Ventas (ARS)']

      // Si hay datos de productos, agregar la columna de producto
      if (data.products) {
        headers.splice(1, 0, 'Producto')
      }

      // ...
      const csvRows = [
        headers.join(','),
        ...allSales.map(sale => {
          // Agregamos comillas a cada valor
          const row = [
            `"${sale.periodo}"`,
            `"${convertToArgentinePeso(sale.ventas)}"`,
          ]
          return row.join(',')
        }),
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: 'text/csv;charset=utf-8;',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      const date = new Date().toISOString().split('T')[0]
      link.setAttribute(
        'download',
        `reporte_ventas_completo_${timePeriod}_${date}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error al exportar el reporte:', err)
      alert('Ocurrió un error al exportar el reporte')
    } finally {
      setIsDownloading(false)
    }
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
            <h3 className='leading-none text-3xl font-bold pb-1 text-slate-800'>
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

        <div className='flex justify-between border-t border-slate-200 pt-4 mt-4'>
          <div className='flex gap-2 justify-between'>
            <Button
              onPress={() => setTimePeriod('today')}
              size='sm'
              className={`transition-colors flex-1 ${
                timePeriod === 'today'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Hoy
            </Button>
            <Button
              onPress={() => setTimePeriod('7d')}
              size='sm'
              className={`transition-colors flex-1 ${
                timePeriod === '7d'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              7D
            </Button>
            <Button
              onPress={() => setTimePeriod('30d')}
              size='sm'
              className={`transition-colors flex-1 ${
                timePeriod === '30d'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              30D
            </Button>
            <Button
              onPress={() => setTimePeriod('90d')}
              size='sm'
              className={`transition-colors flex-1 ${
                timePeriod === '90d'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              90D
            </Button>
          </div>
          <Button
            onPress={handleCsvExport}
            isDisabled={isDownloading || loading || data.series.length === 0}
            isIconOnly
            size='sm'
            variant='light'
            isLoading={isDownloading}
          >
            <Download className='w-4 h-4 text-slate-600' />
          </Button>
        </div>
      </>
    )
  }

  return (
    <CardWithShadow>
      <div className='p-6'>{renderContent()}</div>
    </CardWithShadow>
  )
}

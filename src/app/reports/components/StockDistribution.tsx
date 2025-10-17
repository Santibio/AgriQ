'use client'

import { useState, useEffect, useMemo } from 'react'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
// Se corrige la ruta de importación para que sea relativa
import { getProductStock, ProductStock } from '../actions'
import CardWithShadow from '@/components/card-with-shadow'

// --- LIBRERÍAS DE EXPORTACIÓN ---
// Se cargarán desde un CDN al hacer click.

// --- INTERFACES Y CONSTANTES ---
interface ChartDataItem {
  label: string
  value: number
  color: string
}

interface ExportRow {
  name: string
  quantity: number
  location: string
}

const COLORS = [
  'bg-green-500',
  'bg-teal-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
]

function StockDistributionSkeleton() {
  return (
    <CardWithShadow>
      <div className='p-6'>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex flex-col gap-4 w-full'>
            <div className='h-6 w-1/3 rounded-md bg-slate-200 animate-pulse' />
            <div className='flex gap-2'>
              <div className='h-8 w-20 rounded-md bg-slate-200 animate-pulse' />
              <div className='h-8 w-20 rounded-md bg-slate-200 animate-pulse' />
              <div className='h-8 w-20 rounded-md bg-slate-200 animate-pulse' />
            </div>
          </div>
        </div>
        <div className='space-y-4 mt-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className='flex justify-between mb-2'>
                <div className='h-4 w-2/5 rounded-md bg-slate-200 animate-pulse' />
                <div className='h-4 w-1/5 rounded-md bg-slate-200 animate-pulse' />
              </div>
              <div className='h-4 w-full rounded-full bg-slate-200 animate-pulse' />
            </div>
          ))}
        </div>
      </div>
    </CardWithShadow>
  )
}

// --- COMPONENTE PRINCIPAL ---
export default function StockDistribution() {
  const [filter, setFilter] = useState('ambos')
  const [rawData, setRawData] = useState<ProductStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getProductStock()
        setRawData(data)
        setError(null)
      } catch (e) {
        setError('No se pudo cargar el stock. Intente nuevamente.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const { currentData, maxValue } = useMemo(() => {
    const transformData = (
      data: ProductStock[],
      type: 'market' | 'deposit' | 'combined',
    ): ChartDataItem[] => {
      return data
        .map((item, index) => {
          let value = 0
          if (type === 'market') value = item.marketStock
          else if (type === 'deposit') value = item.depositStock
          else value = item.marketStock + item.depositStock

          return {
            label: item.name,
            value: value,
            color: COLORS[index % COLORS.length],
          }
        })
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
    }

    let dataForChart: ChartDataItem[] = []
    if (filter === 'mercado') dataForChart = transformData(rawData, 'market')
    else if (filter === 'deposito')
      dataForChart = transformData(rawData, 'deposit')
    else dataForChart = transformData(rawData, 'combined')

    const maxVal = Math.max(...dataForChart.map(item => item.value), 1)

    return { currentData: dataForChart, maxValue: maxVal }
  }, [rawData, filter])

  const [animatedData, setAnimatedData] = useState<ChartDataItem[]>([])
  useEffect(() => {
    setAnimatedData(currentData.map(item => ({ ...item, value: 0 })))
    const timer = setTimeout(() => {
      setAnimatedData(currentData)
    }, 100)
    return () => clearTimeout(timer)
  }, [currentData])

  const exportData = useMemo((): ExportRow[] => {
    const flattenedData: ExportRow[] = []

    rawData.forEach(product => {
      const includeMarket = filter === 'ambos' || filter === 'mercado'
      const includeDeposit = filter === 'ambos' || filter === 'deposito'

      if (includeMarket && product.marketStock > 0) {
        flattenedData.push({
          name: product.name,
          quantity: product.marketStock,
          location: 'Mercado',
        })
      }
      if (includeDeposit && product.depositStock > 0) {
        flattenedData.push({
          name: product.name,
          quantity: product.depositStock,
          location: 'Depósito',
        })
      }
    })
    return flattenedData.sort((a, b) => a.name.localeCompare(b.name))
  }, [rawData, filter])

  const handleExcelExport = () => {
    if (exportData.length === 0 || isDownloading) return
    setIsDownloading(true)

    const headers = ['Nombre del producto', 'Cantidad', 'Ubicación']
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => `${row.name},${row.quantity},"${row.location}"`),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `stock_${filter}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  if (loading) return <StockDistributionSkeleton />

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-md'>
        <div className='p-6 flex flex-col items-center justify-center h-96 text-red-600'>
          <AlertCircle className='w-12 h-12 mb-4' />
          <h3 className='text-lg font-semibold'>Ocurrió un Error</h3>
          <p className='text-sm text-slate-500'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <CardWithShadow>
      <div className='p-6'>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex flex-col gap-4'>
            <h3 className='text-lg font-semibold text-slate-800'>
              Stock de Productos
            </h3>
            <div className='flex gap-2 flex-wrap'>
              <button
                onClick={() => setFilter('mercado')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'mercado'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                Mercado
              </button>
              <button
                onClick={() => setFilter('deposito')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'deposito'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                Depósito
              </button>
              <button
                onClick={() => setFilter('ambos')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'ambos'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                Ambos
              </button>
            </div>
          </div>
          <button
            onClick={handleExcelExport}
            disabled={isDownloading}
            className='p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDownloading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Download className='w-4 h-4 text-slate-600' />
            )}
          </button>
        </div>
        <div className='space-y-4'>
          {animatedData.length > 0 ? (
            animatedData.slice(0, 5).map((item, index) => (
              <div key={`${item.label}-${index}`} className='group'>
                <div className='flex justify-between items-center mb-1'>
                  <p className='text-sm font-medium text-slate-600 capitalize'>
                    {item.label}
                  </p>
                  <p className='text-sm font-semibold text-slate-800'>
                    {currentData.find(d => d.label === item.label)?.value || 0}{' '}
                    unidades
                  </p>
                </div>
                <div className='w-full bg-slate-200 rounded-full h-4 overflow-hidden'>
                  <div
                    className={`h-4 rounded-full transition-all ease-out duration-1000 group-hover:opacity-80 ${item.color}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-10'>
              <p className='text-slate-500'>
                No hay stock para mostrar con los filtros actuales.
              </p>
            </div>
          )}
        </div>
      </div>
    </CardWithShadow>
  )
}

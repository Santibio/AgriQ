'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Loader2, AlertCircle, Download } from 'lucide-react'
import {
  getSalesRanking,
  SalesRank,
  TimeFilter,
  MetricFilter,
  SortOrder,
} from '../actions/sale.action'

export default function TogglableProductsDashboard() {
  const [data, setData] = useState<SalesRank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('quantity')
  const [sortOrder, setSortOrder] = useState<SortOrder>('top')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getSalesRanking({
          timeFilter,
          metricFilter,
          sortOrder,
        })
        setData(result)
      } catch (e) {
        setError('No se pudo cargar el ranking de ventas.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeFilter, metricFilter, sortOrder])

  const maxValue =
    data.length > 0
      ? Math.max(
          ...data.map(p =>
            metricFilter === 'price' ? p.totalPrice : p.totalQuantity,
          ),
        )
      : 1

  const formatCurrency = (value: number) =>
    `$${new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`

  const handleToggleSortOrder = () => {
    setSortOrder(prev => (prev === 'top' ? 'bottom' : 'top'))
  }

  const handleCsvExport = () => {
    if (isDownloading || data.length === 0) return
    setIsDownloading(true)

    const headers = [
      'Ranking',
      'Producto',
      'Cantidad Vendida',
      'Total Facturado',
    ]
    const rows = data.map(
      (item, index) =>
        `${index + 1},"${item.name}",${item.totalQuantity},"${formatCurrency(
          item.totalPrice,
        )}"`,
    )

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    link.setAttribute(
      'download',
      `ranking_ventas_${sortOrder}_${timeFilter}_${date}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='space-y-4 pt-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='flex justify-between mb-2'>
                <div className='h-4 bg-slate-200 rounded w-3/5'></div>
                <div className='h-4 bg-slate-200 rounded w-1/5'></div>
              </div>
              <div className='h-2.5 bg-slate-200 rounded-full w-full'></div>
            </div>
          ))}
        </div>
      )
    }
    if (error) {
      return (
        <div className='text-center py-6 text-red-600'>
          <AlertCircle className='mx-auto w-8 h-8 mb-2' />
          <p className='font-semibold'>Error al cargar</p>
        </div>
      )
    }
    if (data.length === 0) {
      return (
        <div className='text-center py-6'>
          <p className='text-slate-500'>No hay ventas en este período.</p>
        </div>
      )
    }
    return (
      <div className='space-y-4'>
        {data.slice(0, 5).map((product, index) => (
          <div key={product.name}>
            <div className='flex justify-between items-center mb-1'>
              <p className='text-sm font-medium text-slate-600 truncate'>
                <span className='font-bold'>{index + 1}.</span> {product.name}
              </p>
              <p className='text-sm font-semibold text-slate-800'>
                {metricFilter === 'price'
                  ? formatCurrency(product.totalPrice)
                  : `${product.totalQuantity} u.`}
              </p>
            </div>
            <div className='w-full bg-slate-200 rounded-full h-2.5'>
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  sortOrder === 'top'
                    ? metricFilter === 'price'
                      ? 'bg-green-500'
                      : 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{
                  width: `${
                    ((metricFilter === 'price'
                      ? product.totalPrice
                      : product.totalQuantity) /
                      maxValue) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-slate-200'>
      <div className='p-4 md:p-6'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-slate-800'>
              Top 5 {sortOrder === 'top' ? 'Más' : 'Menos'} Vendidos
            </h3>
            <p className='text-xs text-slate-400'>
              Por {metricFilter === 'quantity' ? 'Cantidad' : 'Facturación'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-slate-100 hover:bg-slate-200 transition-colors'
              onClick={handleToggleSortOrder}
            >
              <RefreshCw size={14} />
              Ver {sortOrder === 'top' ? 'Menos' : 'Más'}
            </button>
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
        </div>

        <div className='flex flex-col gap-4 mb-4'>
          <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full'>
            <button
              onClick={() => setTimeFilter('day')}
              className={`w-full justify-center px-2 py-1 text-sm rounded-full ${
                timeFilter === 'day'
                  ? 'bg-white shadow'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Hoy
            </button>
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
          </div>
          <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full'>
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
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

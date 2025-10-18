'use client'

import { useState, useEffect } from 'react'
import {
  AlertCircle,
  Download,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from 'lucide-react'
import {
  getSalesRanking,
  SalesRank,
  TimeFilter,
  MetricFilter,
  SortOrder,
} from '../actions/sale.action'
import CardWithShadow from '@/components/card-with-shadow'
import { Button, Tab, Tabs } from '@heroui/react'
import { capitalize } from '@/lib/utils'

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

  const handleMetricChange = (key: React.Key) => {
    if (key === 'quantity' || key === 'price') {
      setMetricFilter(key as MetricFilter)
    }
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
                <span className='font-bold'>{index + 1}.</span>{' '}
                {capitalize(product.name)}
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
    <CardWithShadow>
      <div className='p-6'>
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
            <Button
              onPress={handleToggleSortOrder}
              isIconOnly
              size='sm'
              variant='light'
            >
              {sortOrder === 'top' ? (
                <ArrowDownNarrowWide className='w-4 h-4 text-slate-600' />
              ) : (
                <ArrowUpNarrowWide className='w-4 h-4 text-slate-600' />
              )}
            </Button>
            <Button
              onPress={handleCsvExport}
              isDisabled={isDownloading || loading || data.length === 0}
              isIconOnly
              size='sm'
              variant='light'
              isLoading={isDownloading}
            >
              <Download className='w-4 h-4 text-slate-600' />
            </Button>
          </div>
        </div>

        <div className='flex gap-4 mb-6 flex-col'>
          <div className='flex justify-between items-center gap-2'>
            <Button
              onPress={() => setTimeFilter('day')}
              size='sm'
              className={`transition-colors flex-1 ${
                timeFilter === 'day'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Hoy
            </Button>
            <Button
              onPress={() => setTimeFilter('week')}
              size='sm'
              className={`transition-colors flex-1 ${
                timeFilter === 'week'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Semana
            </Button>
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
          </div>
          <Tabs
            aria-label='Metric Filter'
            selectedKey={metricFilter}
            onSelectionChange={handleMetricChange}
            size='sm'
            fullWidth
            radius='md'
            classNames={{
              tabContent:
                'group-data-[selected=true]:text-white group-data-[selected=true]:font-normal',
              cursor: 'w-full bg-slate-800 font-normal',
            }}
          >
            <Tab key='quantity' title='Cantidad' />
            <Tab key='price' title='Facturación' />
          </Tabs>
        </div>
        {renderContent()}
      </div>
    </CardWithShadow>
  )
}

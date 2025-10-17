'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Trash2, AlertCircle, Download, Loader2 } from 'lucide-react'
import { getDiscardedProducts, DiscardedProduct } from '../actions'
import CardWithShadow from '@/components/card-with-shadow'

function DiscardSkeleton() {
  return (
    <ul>
      {[...Array(3)].map((_, i) => (
        <li
          key={i}
          className='flex items-center justify-between p-3 border-b border-slate-100 animate-pulse'
        >
          <div>
            <div className='h-5 w-32 bg-slate-200 rounded-md mb-1.5'></div>
            <div className='h-3 w-48 bg-slate-200 rounded-md'></div>
          </div>
          <div className='h-7 w-16 bg-slate-200 rounded-full'></div>
        </li>
      ))}
    </ul>
  )
}

// --- Componente Principal del Dashboard de Descartes ---
export default function DiscardDashboard() {
  const [rawData, setRawData] = useState<DiscardedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getDiscardedProducts()
        setRawData(data)
      } catch (e) {
        setError('No se pudieron cargar los descartes.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredDiscards = useMemo(() => {
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000

    return rawData.filter(discard => {
      const searchMatch = discard.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      if (!searchMatch) return false

      const diffInDays = Math.floor(
        (now.getTime() - new Date(discard.createdAt).getTime()) /
          oneDayInMillis,
      )
      if (timeFilter === 'day' && diffInDays > 0) return false
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false

      return true
    })
  }, [searchTerm, timeFilter, rawData])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  const handleCsvExport = () => {
    if (isDownloading || filteredDiscards.length === 0) return
    setIsDownloading(true)

    const headers = [
      'Número de Movimiento',
      'Nombre de Producto',
      'Cantidad Descartada',
      'Motivo',
      'Descartado Por',
      'Fecha',
    ]

    const rows = filteredDiscards.map(d =>
      [
        d.id,
        `"${d.product.name}"`,
        d.quantity,
        d.reason,
        `"${d.user.name} ${d.user.lastName}"`,
        formatDate(d.createdAt),
      ].join(','),
    )

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `descartes_${date}.csv`)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const renderContent = () => {
    if (loading) return <DiscardSkeleton />
    if (error) {
      return (
        <div className='text-center py-10 px-4 text-red-600'>
          <AlertCircle className='mx-auto w-10 h-10 mb-2' />
          <p className='font-semibold'>Ocurrió un error</p>
          <p className='text-sm text-slate-500'>{error}</p>
        </div>
      )
    }
    if (filteredDiscards.length > 0) {
      return (
        <ul>
          {filteredDiscards.slice(0,5).map((discard, index) => (
            <li
              key={discard.id}
              className={`flex items-center justify-between p-3 ${
                index < filteredDiscards.length - 1
                  ? 'border-b border-slate-100'
                  : ''
              }`}
            >
              <div>
                <p className='font-semibold text-slate-800 capitalize'>
                  {discard.product.name}
                </p>
                <p className='text-xs text-slate-500'>
                  Por {discard.user.name} el {formatDate(discard.createdAt)} (
                  {discard.reason})
                </p>
              </div>
              <div className='flex items-center gap-1.5 text-red-600 font-bold text-sm bg-red-500/10 px-2.5 py-1 rounded-full'>
                <Trash2 size={14} />
                <span>{discard.quantity}</span>
              </div>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <div className='text-center py-10 px-4'>
        <p className='text-slate-500'>No se encontraron descartes.</p>
        <p className='text-sm text-slate-400'>
          Intenta ajustar tu búsqueda o filtro.
        </p>
      </div>
    )
  }

  return (
    <CardWithShadow>
      <div className='p-6'>
        <div className='mb-6 flex justify-between items-center'>
          <h3 className='text-lg font-semibold text-slate-800'>
            Productos Descartados
          </h3>
          <button
            onClick={handleCsvExport}
            disabled={isDownloading || filteredDiscards.length === 0}
            className='p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDownloading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Download className='w-4 h-4 text-slate-500' />
            )}
          </button>
        </div>
        <div className='space-y-4 mb-6'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Buscar por nombre de producto...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>
          <div className='flex justify-center gap-2'>
            <button
              onClick={() => setTimeFilter('day')}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                timeFilter === 'day'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                timeFilter === 'week'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Mes
            </button>
          </div>
        </div>
        <div className='w-full rounded-lg bg-white border border-slate-200'>
          {renderContent()}
        </div>
      </div>
    </CardWithShadow>
  )
}

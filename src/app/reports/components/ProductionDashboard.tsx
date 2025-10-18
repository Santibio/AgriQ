'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Boxes, AlertCircle, Download } from 'lucide-react'
import { getProductionBatches, ProductionBatch } from '../actions/batchs.action'
import CardWithShadow from '@/components/card-with-shadow'
import { Button, Input } from '@heroui/react'

function ProductionSkeleton() {
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

// --- Componente Principal del Dashboard ---
export default function ProductionDashboard() {
  const [rawData, setRawData] = useState<ProductionBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getProductionBatches()
        setRawData(data)
      } catch (e) {
        setError('No se pudieron cargar los lotes de producción.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredBatches = useMemo(() => {
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000

    return rawData.filter(batch => {
      const searchMatch = batch.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      if (!searchMatch) return false

      const diffInMillis = now.getTime() - new Date(batch.createdAt).getTime()
      const diffInDays = Math.floor(diffInMillis / oneDayInMillis)

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
    if (isDownloading || filteredBatches.length === 0) return
    setIsDownloading(true)

    const headers = [
      'Número de Lote',
      'Nombre Producto',
      'Cantidad Producida',
      'Creado Por',
      'Fecha de Creación',
    ]

    const rows = filteredBatches.map(batch =>
      [
        batch.id,
        `"${batch.product.name}"`, // comillas para evitar problemas con comas
        batch.initialQuantity,
        `"${batch.user.name} ${batch.user.lastName}"`,
        formatDate(batch.createdAt),
      ].join(','),
    )

    const csvContent = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    const date = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `lotes_produccion_${date}.csv`)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const renderContent = () => {
    if (loading) {
      return <ProductionSkeleton />
    }
    if (error) {
      return (
        <div className='text-center py-10 px-4 text-red-600'>
          <AlertCircle className='mx-auto w-10 h-10 mb-2' />
          <p className='font-semibold'>Ocurrió un error</p>
          <p className='text-sm text-slate-500'>{error}</p>
        </div>
      )
    }
    if (filteredBatches.length > 0) {
      return (
        <ul>
          {filteredBatches.slice(0, 5).map((batch, index) => (
            <li
              key={batch.id}
              className={`flex items-center justify-between p-3 ${
                index < filteredBatches.length - 1
                  ? 'border-b border-slate-100'
                  : ''
              }`}
            >
              <div>
                <p className='font-semibold text-slate-800 capitalize'>
                  {batch.product.name}
                </p>
                <p className='text-xs text-slate-500'>
                  Lote #{batch.id} • Por {batch.user.name} el{' '}
                  {formatDate(batch.createdAt)}
                </p>
              </div>
              <div className='flex items-center gap-1.5 text-blue-600 font-bold text-sm bg-blue-100 px-2.5 py-1 rounded-full'>
                <Boxes size={14} />
                <span>{batch.initialQuantity}</span>
              </div>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <div className='text-center py-10 px-4'>
        <p className='text-slate-500'>No se encontraron lotes.</p>
        <p className='text-sm text-slate-400'>
          Intenta ajustar tu búsqueda o filtro.
        </p>
      </div>
    )
  }

  return (
    <CardWithShadow>
      <div className='p-6'>
        <div className='mb-4 flex justify-between'>
          <h3 className='text-lg font-semibold text-slate-800'>
            Lotes de Producción
          </h3>
          <Button
            onPress={handleCsvExport}
            isIconOnly
            size='sm'
            variant='light'
            isLoading={isDownloading}
            isDisabled={isDownloading || filteredBatches.length === 0}
          >
            <Download className='w-4 h-4 text-slate-600' />
          </Button>
        </div>
        <div className='flex flex-col mb-6 gap-4'>
          <Input
            placeholder='Buscar por nombre de producto...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            startContent={<Search size={18} />}
          />
          <div className='flex gap-2 justify-between'>
            <Button
              onPress={() => setTimeFilter('day')}
              size='sm'
              className={`pransition-colors flex-1 ${
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
              className={`pransition-colors flex-1 ${
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
              className={`pransition-colors flex-1 ${
                timeFilter === 'month'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Mes
            </Button>
          </div>
        </div>
        <div className='w-full rounded-lg bg-white border border-slate-200'>
          {renderContent()}
        </div>
      </div>
    </CardWithShadow>
  )
}

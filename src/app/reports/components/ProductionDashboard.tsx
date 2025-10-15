'use client'

import { useState, useMemo } from 'react'
import { Button, Chip, Input } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { Search, Boxes, ChevronRight } from 'lucide-react'

// --- Interfaces para los Datos ---
interface Product {
  name: string
  image: string
}

interface Batch {
  id: number
  product: Product
  initialQuantity: number
  createdAt: Date
}

// --- DATOS DE EJEMPLO (reemplaza esto con tus datos reales) ---
const mockBatches: Batch[] = [
  {
    id: 101,
    product: { name: 'Tomate Cherry', image: '/images/tomato.jpg' },
    initialQuantity: 250,
    createdAt: new Date(),
  },
  {
    id: 102,
    product: { name: 'Lechuga Morada', image: '/images/lettuce.jpg' },
    initialQuantity: 150,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }, // Hace 3 días
  {
    id: 103,
    product: { name: 'Albahaca Fresca', image: '/images/basil.jpg' },
    initialQuantity: 80,
    createdAt: new Date(),
  },
  {
    id: 104,
    product: { name: 'Zanahoria Baby', image: '/images/carrot.jpg' },
    initialQuantity: 300,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  }, // Hace 8 días
  {
    id: 105,
    product: { name: 'Rúcula Selvática', image: '/images/arugula.jpg' },
    initialQuantity: 120,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  }, // Hace 15 días
]

// --- Componente Principal del Dashboard ---
export default function ProductionDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week')

  const filteredBatches = useMemo(() => {
    const now = new Date()
    // Milliseconds in a day, used for date difference calculation
    const oneDayInMillis = 24 * 60 * 60 * 1000

    return mockBatches.filter(batch => {
      // 1. Filtro por búsqueda de nombre (sin cambios)
      const searchMatch = batch.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      if (!searchMatch) return false

      // 2. Filtro por período de tiempo (usando matemática nativa de Date)
      const diffInMillis = now.getTime() - batch.createdAt.getTime()
      const diffInDays = Math.floor(diffInMillis / oneDayInMillis)

      if (timeFilter === 'day' && diffInDays > 0) return false // Solo hoy
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false

      return true
    })
  }, [searchTerm, timeFilter])

  // Función para formatear la fecha usando Intl.DateTimeFormat (nativo de JS)
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <CardWithShadow className='p-4 max-w-lg mx-auto'>
      {/* --- Cabecera y Controles --- */}
      <div className='mb-6 flex justify-between'>
        <h3 className='text-lg font-semibold text-slate-800'>
          Lotes de Producción
        </h3>
        <Button isIconOnly variant='flat' size='sm'>
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>
      <div className='space-y-4 mb-6'>
        {/* Input de Búsqueda */}
        <Input
          placeholder='Buscar por nombre de producto...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          startContent={<Search className='text-slate-400' size={18} />}
          variant='flat'
          className='bg-white'
        />

        {/* Filtros de Tiempo */}
        <div className='flex justify-center gap-2'>
          <Chip
            onClick={() => setTimeFilter('day')}
            variant={timeFilter === 'day' ? 'solid' : 'flat'}
            className='cursor-pointer'
          >
            Hoy
          </Chip>
          <Chip
            onClick={() => setTimeFilter('week')}
            variant={timeFilter === 'week' ? 'solid' : 'flat'}
            className='cursor-pointer'
          >
            Semana
          </Chip>
          <Chip
            onClick={() => setTimeFilter('month')}
            variant={timeFilter === 'month' ? 'solid' : 'flat'}
            className='cursor-pointer'
          >
            Mes
          </Chip>
        </div>
      </div>

      {/* --- Listado de Lotes --- */}
      {/* --- Compact List --- */}
      <div className='w-full rounded-lg bg-white border border-slate-200'>
        {filteredBatches.length > 0 ? (
          <ul>
            {filteredBatches.map((batch, index) => (
              <li
                key={batch.id}
                className={`flex items-center justify-between p-3 ${
                  index < filteredBatches.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <div>
                  <p className='font-semibold text-slate-800'>
                    {batch.product.name}
                  </p>
                  <p className='text-xs text-slate-500'>
                    Lote #{batch.id} • {formatDate(batch.createdAt)}
                  </p>
                </div>
                <div className='flex items-center gap-1.5 text-primary font-bold text-sm bg-primary/10 px-2.5 py-1 rounded-full'>
                  <Boxes size={14} />
                  <span>{batch.initialQuantity}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-center py-10 px-4'>
            <p className='text-slate-500'>No se encontraron lotes.</p>
            <p className='text-sm text-slate-400'>
              Intenta ajustar tu búsqueda o filtro.
            </p>
          </div>
        )}
      </div>
    </CardWithShadow>
  )
}

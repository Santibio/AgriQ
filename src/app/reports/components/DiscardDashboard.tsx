'use client'

import { useState, useMemo } from 'react'
import { Button, Chip, Input } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { Search, Trash2, ChevronRight } from 'lucide-react'

// --- Interfaces para los Datos de Descartes ---
interface Product {
  name: string
  image: string
}

interface Discard {
  id: number
  product: Product
  discardedQuantity: number
  reason: 'Dañado' | 'Vencido' | 'Otro'
  createdAt: Date
}

// --- DATOS DE EJEMPLO para Descartes ---
const mockDiscards: Discard[] = [
  {
    id: 201,
    product: { name: 'Lechuga Morada', image: '/images/lettuce.jpg' },
    discardedQuantity: 15,
    reason: 'Dañado',
    createdAt: new Date(),
  },
  {
    id: 202,
    product: { name: 'Tomate Cherry', image: '/images/tomato.jpg' },
    discardedQuantity: 5,
    reason: 'Vencido',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  }, // Hace 2 días
  {
    id: 203,
    product: { name: 'Zanahoria Baby', image: '/images/carrot.jpg' },
    discardedQuantity: 10,
    reason: 'Dañado',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  }, // Hace 10 días
  {
    id: 204,
    product: { name: 'Albahaca Fresca', image: '/images/basil.jpg' },
    discardedQuantity: 8,
    reason: 'Otro',
    createdAt: new Date(),
  },
  {
    id: 205,
    product: { name: 'Rúcula Selvática', image: '/images/arugula.jpg' },
    discardedQuantity: 20,
    reason: 'Vencido',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  }, // Hace 20 días
]

// --- Componente Principal del Dashboard de Descartes ---
export default function DiscardDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week')

  const filteredDiscards = useMemo(() => {
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000

    return mockDiscards.filter(discard => {
      const searchMatch = discard.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      if (!searchMatch) return false

      const diffInDays = Math.floor(
        (now.getTime() - discard.createdAt.getTime()) / oneDayInMillis,
      )
      if (timeFilter === 'day' && diffInDays > 0) return false
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false

      return true
    })
  }, [searchTerm, timeFilter])

  return (
    <CardWithShadow className='p-4 max-w-lg mx-auto'>
      {/* --- Cabecera y Controles --- */}
      <div className='mb-6 flex justify-between items-center'>
        <h3 className='text-lg font-semibold text-slate-800'>
          Productos Descartados
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

      {/* --- Listado de Descartes Compacto --- */}
      <div className='w-full rounded-lg bg-white border border-slate-200'>
        {filteredDiscards.length > 0 ? (
          <ul>
            {filteredDiscards.map((discard, index) => (
              <li
                key={discard.id}
                className={`flex items-center justify-between p-3 ${
                  index < filteredDiscards.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <div>
                  <p className='font-semibold text-slate-800'>
                    {discard.product.name}
                  </p>
                </div>
                {/* Indicador de cantidad con estilo de "alerta" */}
                <div className='flex items-center gap-1.5 text-red-600 font-bold text-sm bg-red-500/10 px-2.5 py-1 rounded-full'>
                  <Trash2 size={14} />
                  <span>{discard.discardedQuantity}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-center py-10 px-4'>
            <p className='text-slate-500'>No se encontraron descartes.</p>
            <p className='text-sm text-slate-400'>
              Intenta ajustar tu búsqueda o filtro.
            </p>
          </div>
        )}
      </div>
    </CardWithShadow>
  )
}

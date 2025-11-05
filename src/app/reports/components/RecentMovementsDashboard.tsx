// src/components/dashboard/MovementCountDashboard.tsx

'use client'

import { useState, useMemo } from 'react'
import { CardBody, Chip, Button } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import paths from '@/lib/paths' // Asumiendo que tienes este archivo de rutas

// --- Interfaces y Datos de Ejemplo ---
// Para este componente, solo necesitamos la fecha de creación del movimiento
interface Movement {
  id: number
  createdAt: Date
}

const mockMovements: Movement[] = [
  // Movimientos de hoy
  { id: 1, createdAt: new Date() },
  { id: 2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // Hace 2 horas
  // Movimientos de esta semana
  { id: 3, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 4, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  // Movimientos de este mes
  { id: 5, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: 6, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { id: 7, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
]

type TimeFilter = 'day' | 'week' | 'month'

// Mapeo para los textos descriptivos
const labelMap: Record<TimeFilter, string> = {
  day: 'en el día',
  week: 'en la semana',
  month: 'en el mes',
}

export default function MovementCountDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')

  // --- Lógica para contar los movimientos según el filtro ---
  const movementCount = useMemo(() => {
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000

    const filteredMovements = mockMovements.filter(movement => {
      const diffInMillis = now.getTime() - movement.createdAt.getTime()
      const diffInDays = Math.floor(diffInMillis / oneDayInMillis)

      if (timeFilter === 'day' && diffInDays > 0) return false
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false

      return true
    })

    return filteredMovements.length
  }, [timeFilter])

  return (
    <CardWithShadow className='h-full'>
      <CardBody className='p-4 md:p-6 flex flex-col justify-between'>
        {/* --- Cabecera --- */}
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-semibold text-slate-800'>
            Total de Movimientos
          </h3>
          <Link href={paths.movements()}>
            <Button isIconOnly variant='flat' size='sm'>
              <ChevronRight className='w-4 h-4' />
            </Button>
          </Link>
        </div>

        {/* --- KPI Principal (El Número) --- */}
        <div className='text-center my-6'>
          <p className='text-6xl font-bold text-slate-800'>{movementCount}</p>
          <p className='text-slate-500'>Movimientos {labelMap[timeFilter]}</p>
        </div>

        {/* --- Búsqueda de Tiempo --- */}
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
      </CardBody>
    </CardWithShadow>
  )
}

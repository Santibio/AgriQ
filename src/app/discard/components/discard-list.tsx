'use client'

import { CircleX, FishOff, ShieldAlert } from 'lucide-react'
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Discard,
} from '@prisma/client'
import { JSX, useState } from 'react'
import CardWithShadow from '@/components/card-with-shadow'
import { Search } from '@/components/search'
import EmptyListMsg from '@/components/empty-list'
// Asumimos que estas funciones helper existen en tu proyecto
// import { capitalize } from '@/lib/utils'
// import { timeAgo } from '@/lib/helpers/date'

// --- Funciones Helper (incluidas para que el componente sea autocontenido) ---
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const timeAgo = (date: Date): string => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  )
  let interval = seconds / 31536000
  if (interval > 1) return `hace ${Math.floor(interval)} años`
  interval = seconds / 2592000
  if (interval > 1) return `hace ${Math.floor(interval)} meses`
  interval = seconds / 86400
  if (interval > 1) return `hace ${Math.floor(interval)} días`
  interval = seconds / 3600
  if (interval > 1) return `hace ${Math.floor(interval)} horas`
  interval = seconds / 60
  if (interval > 1) return `hace ${Math.floor(interval)} minutos`
  return `hace ${Math.floor(seconds)} segundos`
}

// --- Interfaces y Tipos ---
interface DiscardListProps {
  filteredMovements: MovementWithRelations[]
}

type MovementWithRelations = Movement & {
  movementDetail: (MovementDetail & {
    batch: Batch & {
      product: Product
    }
  })[]
  discard: Discard | null
}

// --- Mapeo de Estilos por Motivo ---
const REASON_MAP: Record<
  Discard['reason'],
  {
    icon: JSX.Element
    background: string
    text: string
    border: string
    label: string
  }
> = {
  EXPIRED: {
    icon: <FishOff className='h-5 w-5' />,
    background: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Vencido',
  },
  DAMAGED: {
    icon: <ShieldAlert className='h-5 w-5' />,
    background: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Dañado',
  },
  OTHER: {
    icon: <CircleX className='h-5 w-5' />,
    background: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Otro',
  },
}

// --- Componente con Estilo Mejorado ---
export default function ImprovedDiscardList({
  filteredMovements,
}: DiscardListProps) {
  const [filteredDiscards, setFilteredDiscards] = useState(filteredMovements)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
    const filtered = filteredMovements.filter(movement =>
      movement.movementDetail[0]?.batch.product.name
        .toLowerCase()
        .includes(searchTermValue.toLowerCase()),
    )
    setFilteredDiscards(filtered)
  }

  return (
    <div className='flex flex-col gap-2'>
      <Search
        placeholder='Buscar por nombre de producto'
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
      />
      {filteredDiscards?.length > 0 ? (
        filteredDiscards.map(movement => {
          const reasonInfo = movement.discard
            ? REASON_MAP[movement.discard.reason]
            : null
          const productInfo = movement.movementDetail[0]?.batch.product
          const quantity = movement.movementDetail[0]?.quantity

          // Si falta información esencial, no se renderiza el elemento
          if (!reasonInfo || !productInfo) return null

          return (
            <CardWithShadow key={movement.id}>
              <div className='flex'>
                {/* Icono y acento de color a la izquierda */}
                <div
                  className={`flex items-center justify-center p-4 ${reasonInfo.background} ${reasonInfo.text}`}
                >
                  {reasonInfo.icon}
                </div>

                {/* Contenido principal */}
                <div className='flex flex-1 flex-col justify-center p-3'>
                  <div className='flex items-start justify-between'>
                    <h3 className='text-base font-semibold text-slate-800'>
                      {capitalize(productInfo.name)}
                    </h3>
                    <p className='flex-shrink-0 text-xs text-slate-500 ml-4 whitespace-nowrap'>
                      {timeAgo(movement.createdAt)}
                    </p>
                  </div>
                  <div className='mt-2 flex items-center justify-between text-sm'>
                    {/* Badge para el motivo */}
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${reasonInfo.background} ${reasonInfo.text}`}
                    >
                      {reasonInfo.label}
                    </div>
                    {/* Cantidad */}
                    <p className='font-bold text-slate-700'>
                      {quantity}{' '}
                      <span className='font-normal text-slate-500'>
                        unidades
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardWithShadow>
          )
        })
      ) : (
        <EmptyListMsg text='No hay descartes disponibles.' />
      )}
    </div>
  )
}

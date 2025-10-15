// src/components/charts/DiscardReasonSemiDonut.tsx

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import { CardBody } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'

// --- Importación dinámica de ApexCharts (solo se carga en el cliente) ---
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// --- Mock Data: Simula la distribución de descartes por motivo ---
const mockDiscardData = [
  { reason: 'Dañado', count: 45, color: '#dc2626' }, // Rojo (Tailwind red-600)
  { reason: 'Vencido', count: 30, color: '#f59e0b' }, // Naranja (Tailwind amber-500)
  { reason: 'Otro', count: 12, color: '#6b7280' }, // Gris (Tailwind gray-500)
]

interface SelectedSlice {
  reason: string
  count: number
  color: string
}

export default function DiscardReasonSemiDonut() {
  const [selectedSlice, setSelectedSlice] = useState<SelectedSlice | null>(null)

  const totalDiscards = mockDiscardData.reduce(
    (sum, item) => sum + item.count,
    0,
  )

  // --- Configuración de ApexCharts para el gráfico interactivo ---
  const [series] = useState(mockDiscardData.map(item => item.count))
  const [options] = useState<ApexOptions>({
    chart: {
      type: 'donut',
      height: 200, // ✨ Altura del gráfico ajustada para evitar el recorte
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const index = config.dataPointIndex
          setSelectedSlice(mockDiscardData[index])
        },
      },
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetX: 0,
        offsetY: 0, // ✨ Ajustado a 0 o un valor pequeño si es necesario
        donut: {
          size: '80%',
          labels: {
            show: true,
            name: { show: false }, // Ocultar el nombre individual de la porción
            value: { show: false }, // Ocultar el valor individual de la porción
            total: {
              show: true,
              showAlways: true,
              label: 'Total Descartado',
              fontSize: '12px', // Tamaño de fuente más pequeño para el total
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: '#6b7280',
              formatter: () => `${totalDiscards} u.`, // Mostrar unidades en el total
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    labels: mockDiscardData.map(item => item.reason),
    colors: mockDiscardData.map(item => item.color),
    legend: { show: false },
    stroke: { width: 0 },
    // Opcional: animaciones más suaves al cargar o actualizar
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  })

  return (
    <CardWithShadow>
      <CardBody className='p-4 md:p-6 overflow-hidden'>
        <h3 className='text-lg font-semibold text-slate-800 mb-1'>
          {' '}
          {/* ✨ mb-1 para reducir espacio */}
          Motivos de Descarte
        </h3>
        <p className='text-sm text-slate-500 mb-3'>
          {' '}
          {/* ✨ mb-3 para reducir espacio */}
          Resumen de mermas por categoría.
        </p>

        <div className='h-40 flex items-center justify-center cursor-pointer'>
          {' '}
          {/* ✨ Altura reducida para el contenedor del gráfico */}
          <Chart
            options={options}
            series={series}
            type='donut'
            width='100%'
            height='100%'
          />
        </div>

        {/* --- SECCIÓN INTERACTIVA --- */}
        {/* ✨ mb-0 y mt-4 para controlar el espaciado */}
        <div className='mt-[-60px] flex items-center justify-center text-center'>
          {selectedSlice ? (
            <div className='flex items-center gap-2 animate-fade-in'>
              <span
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: selectedSlice.color }}
              ></span>
              <p className='font-semibold text-slate-700'>
                {selectedSlice.reason}:{' '}
                <span className='font-bold'>
                  {selectedSlice.count} unidades
                </span>
              </p>
            </div>
          ) : (
            <p className='text-sm text-slate-400'>
              Haz clic en una sección para ver el detalle.
            </p>
          )}
        </div>
      </CardBody>
    </CardWithShadow>
  )
}

// src/components/charts/OrderStatusDonut.tsx

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import { CardBody } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'

// --- Importación dinámica de ApexCharts (solo se carga en el cliente) ---
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// --- Mock Data: Simula la distribución de estados de pedidos ---
const mockOrderData = [
  { status: 'Cobrados', count: 125, color: '#22c55e' }, // Verde
  { status: 'Pendientes', count: 45, color: '#f59e0b' }, // Naranja
  { status: 'Cancelados', count: 15, color: '#ef4444' }, // Rojo
]

interface SelectedSlice {
  status: string
  count: number
  color: string
}

export default function OrderStatusDonut() {
  const [selectedSlice, setSelectedSlice] = useState<SelectedSlice | null>(null)

  const totalOrders = mockOrderData.reduce((sum, item) => sum + item.count, 0)

  // --- Configuración de ApexCharts para el gráfico de donut completo ---
  const [series] = useState(mockOrderData.map(item => item.count))
  const [options] = useState<ApexOptions>({
    chart: {
      type: 'donut',
      height: 250,
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const index = config.dataPointIndex
          setSelectedSlice(mockOrderData[index])
        },
      },
    },
    plotOptions: {
      pie: {
        // ✨ Ya no se necesitan startAngle y endAngle para un círculo completo
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: `Total Pedidos ${totalOrders}`,
              fontSize: '14px',
              color: '#6b7280',
            },
            value: { show: false },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    labels: mockOrderData.map(item => item.status),
    colors: mockOrderData.map(item => item.color),
    legend: { show: false },
    stroke: { width: 4, colors: ['#fff'] }, // Borde blanco entre porciones
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  })

  return (
    <CardWithShadow>
      <CardBody className='p-4 md:p-6'>
        <h3 className='text-lg font-semibold text-slate-800 mb-1'>
          Estado de Pedidos
        </h3>
        <p className='text-sm text-slate-500 mb-3'>
          Resumen de los pedidos del mes.
        </p>

        <div className='h-48 flex items-center justify-center cursor-pointer'>
          <Chart
            options={options}
            series={series}
            type='donut'
            width='100%'
            height='100%'
          />
        </div>

        {/* --- SECCIÓN INTERACTIVA --- */}
        <div className='mt-4 h-12 flex items-center justify-center text-center'>
          {selectedSlice ? (
            <div className='flex items-center gap-2 animate-fade-in'>
              <span
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: selectedSlice.color }}
              ></span>
              <p className='font-semibold text-slate-700'>
                {selectedSlice.status}:{' '}
                <span className='font-bold'>{selectedSlice.count} pedidos</span>
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

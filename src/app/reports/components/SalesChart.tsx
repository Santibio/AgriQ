// src/components/charts/SalesChart.tsx

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import { CardBody, Chip } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { ArrowUp, ChevronDown, ChevronRight } from 'lucide-react'

// --- Importación dinámica de ApexCharts (solo se carga en el cliente) ---
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// --- Mock Data: Simula datos para diferentes períodos de tiempo ---
const dataSets = {
  'Últimos 7 días': [3200, 3100, 3600, 3400, 4800, 5500, 5200],
  'Últimos 30 días': [15100, 16400, 14200, 17800],
  'Últimos 90 días': [45000, 42000, 51000, 48000, 55000],
}
type TimePeriod = keyof typeof dataSets

export default function SalesChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Últimos 7 días')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- El estado del gráfico ahora se actualiza con un useEffect ---
  const [chartSeries, setChartSeries] = useState([
    { data: dataSets[timePeriod] },
  ])

  useEffect(() => {
    setChartSeries([{ data: dataSets[timePeriod] }])
  }, [timePeriod])

  // --- ✨ Métricas dinámicas calculadas basadas en el período seleccionado ---
  const dynamicMetrics = useMemo(() => {
    const data = dataSets[timePeriod]
    const total = data.reduce((sum, value) => sum + value, 0)
    let percentageChange = 0

    // Simulación de cambio porcentual
    if (timePeriod === 'Últimos 7 días') percentageChange = 12.1
    if (timePeriod === 'Últimos 30 días') percentageChange = 8.5
    if (timePeriod === 'Últimos 90 días') percentageChange = 15.3

    return {
      totalSales: `$${(total / 1000).toFixed(1)}k`,
      subtitle: `Ventas en ${timePeriod.toLowerCase()}`,
      percentage: percentageChange,
    }
  }, [timePeriod])

  // --- Configuración clave de ApexCharts (sin cambios) ---
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { width: 3, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.1 } },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: value =>
          `$${new Intl.NumberFormat('es-AR').format(value).toString()}`,
      },
    },
    colors: ['#3b82f6'],
  }

  // --- Lógica para el Dropdown ---
  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
    setIsDropdownOpen(false)
  }

  useEffect(() => {
    // Cierra el dropdown si se hace clic fuera de él
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownRef])

  return (
    // ✨ Se añade el fondo oscuro y el texto blanco directamente a la tarjeta
    <CardWithShadow >
      <CardBody className='p-4 md:p-6'>
        <div className='flex justify-between items-start'>
          <div>
            {/* ✨ Métrica dinámica */}
            <h3 className='leading-none text-4xl font-bold pb-1'>
              {dynamicMetrics.totalSales}
            </h3>
            {/* ✨ Subtítulo dinámico */}
            <p className='text-base font-normal text-slate-400'>
              {dynamicMetrics.subtitle}
            </p>
          </div>
          {/* ✨ Porcentaje dinámico */}
          <Chip color='success' variant='light' size='sm' className='text-base'>
            {dynamicMetrics.percentage}% <ArrowUp className='w-4 h-4 ms-1' />
          </Chip>
        </div>

        {/* Gráfico de ApexCharts */}
        <div className='h-48 mt-4'>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type='area'
            width='100%'
            height='100%'
          />
        </div>

        <div className='grid grid-cols-1 items-center border-t border-slate-700'>
          <div className='flex justify-between items-center pt-5'>
            {/* --- ✨ Dropdown Funcional --- */}
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='text-sm font-medium text-slate-400 hover:text-white text-center inline-flex items-center'
                type='button'
              >
                {timePeriod}
                <ChevronDown
                  className={`w-3 h-3 ms-2 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div className='absolute bottom-full mb-2 z-10 bg-slate-800 divide-y divide-slate-700 rounded-lg shadow-lg w-44'>
                  <ul className='py-2 text-sm text-slate-300'>
                    {(Object.keys(dataSets) as TimePeriod[]).map(period => (
                      <li key={period}>
                        <button
                          onClick={() => handlePeriodChange(period)}
                          className='block w-full text-left px-4 py-2 hover:bg-slate-700 hover:text-white'
                        >
                          {period}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <a
              href='#'
              className='uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-500 hover:text-blue-400'
            >
              Reporte de Ventas
              <ChevronRight className='w-4 h-4 ms-1' />
            </a>
          </div>
        </div>
      </CardBody>
    </CardWithShadow>
  )
}

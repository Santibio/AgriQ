'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ApexOptions } from 'apexcharts'
import { Download, Loader2, AlertCircle } from 'lucide-react'
import {
  getClientSalesRanking,
  ClientSaleRank,
  TimeFilter,
  MetricFilter,
} from '../actions/customers.action'
import CardWithShadow from '@/components/card-with-shadow'
import { Button, Tab, Tabs } from '@heroui/react'
import { convertToArgentinePeso } from '@/lib/helpers/number'

// --- Componente Wrapper para ApexCharts (reutilizado) ---
const ApexChart = ({
  options,
  series,
  type,
  height,
}: {
  options: ApexOptions
  series: number[]
  type: string
  height: string | number
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    if (
      !document.querySelector(
        'script[src="https://cdn.jsdelivr.net/npm/apexcharts"]',
      )
    ) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/apexcharts'
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])
  useEffect(() => {
    if (
      isLoaded &&
      chartRef.current &&
      typeof window.ApexCharts !== 'undefined'
    ) {
      const chart = new window.ApexCharts(chartRef.current, {
        ...options,
        series,
        chart: { ...options.chart, type, height },
      })
      chart.render()
      return () => chart.destroy()
    }
  }, [options, series, type, height, isLoaded])
  if (!isLoaded)
    return (
      <div className='h-full w-full flex items-center justify-center'>
        <Loader2 className='w-6 h-6 animate-spin text-slate-400' />
      </div>
    )
  return <div ref={chartRef} />
}

interface ChartSlice {
  name: string
  value: number
  color: string
}

export default function ClientDonutDashboard() {
  const [data, setData] = useState<ClientSaleRank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('year')
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('price')
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedSlice, setSelectedSlice] = useState<ChartSlice | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setSelectedSlice(null) // Resetea la selección al cambiar de filtro
      try {
        const result = await getClientSalesRanking({
          timeFilter,
          metricFilter,
          sortOrder: 'top', // Siempre pedimos el Top
        })
        setData(result)
      } catch (e) {
        setError('No se pudo cargar el ranking de clientes.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeFilter, metricFilter])

  const handleMetricChange = (key: React.Key) => {
    if (key === 'quantity' || key === 'price') {
      setMetricFilter(key as MetricFilter)
    }
  }

  const chartData = useMemo((): ChartSlice[] => {
    const top3 = data.slice(0, 3)
    const others = data.slice(3)
    const chartSlices: ChartSlice[] = top3.map((client, i) => ({
      name: client.name,
      value:
        metricFilter === 'price' ? client.totalPrice : client.totalQuantity,
      color: ['#6366F1', '#10B981', '#F59E0B'][i],
    }))

    if (others.length > 0) {
      const othersValue = others.reduce(
        (sum, client) =>
          sum +
          (metricFilter === 'price' ? client.totalPrice : client.totalQuantity),
        0,
      )
      chartSlices.push({ name: 'Otros', value: othersValue, color: '#6b7280' })
    }
    return chartSlices
  }, [data, metricFilter])

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 180,
      events: {
        dataPointSelection: (_, __, config) => {
          const index = config.dataPointIndex
          if (chartData[index]) {
            setSelectedSlice(chartData[index])
          }
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: `Total`,
              fontSize: '14px',
              color: '#6b7280',
            },
            value: { show: true, fontSize: '13px' },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    labels: chartData.map(d => d.name),
    colors: chartData.map(d => d.color),
    legend: { show: false },
    stroke: { width: 3 },
  }

  const handleCsvExport = async () => {
    if (isDownloading || chartData.length === 0) return;
    setIsDownloading(true);

    try {
      // Usar la acción existente para obtener los datos
      const allCustomers = await getClientSalesRanking({
        timeFilter,
        metricFilter,
        sortOrder: 'top' // Siempre ordenar de mayor a menor para la exportación
      });
      
      // Mapear los datos al formato esperado
      const formattedCustomers = allCustomers.map(customer => ({
        name: customer.name,
        value: metricFilter === 'price' ? customer.totalPrice : customer.totalQuantity,
        purchaseCount: customer.totalQuantity, // Asumiendo que cada compra es una unidad
        lastPurchase: new Date().toISOString() // Agregar lógica real si está disponible
      }));

      // Ordenar por valor (de mayor a menor)
      const sortedCustomers = [...formattedCustomers].sort((a, b) => b.value - a.value);

      // Crear encabezados del CSV
      const headers = [
        'Cliente',
        `Valor (${metricFilter === 'price' ? 'ARS' : 'Unidades'})`,
        'Cantidad de Compras',
        'Última Compra'
      ];

      // Crear filas del CSV con todos los clientes
      const csvRows = [
        headers.join(','),
        ...sortedCustomers.map(customer => {
          const formattedValue = metricFilter === 'price' 
            ? convertToArgentinePeso(customer.value)
            : Math.round(customer.value);
            
          return [
            `"${customer.name}"`,
            `"${formattedValue}"`,
            customer.purchaseCount || '',
            customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : ''
          ].join(',');
        })
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: 'text/csv;charset=utf-8;',
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `clientes_completo_${timeFilter}_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar el reporte de clientes:', error);
      alert('Ocurrió un error al exportar el reporte de clientes');
    } finally {
      setIsDownloading(false);
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='h-[240px] flex items-center justify-center'>
          <Loader2 className='w-8 h-8 text-slate-400 animate-spin' />
        </div>
      )
    }
    if (error) {
      return (
        <div className='h-[240px] flex flex-col items-center justify-center text-red-600'>
          <AlertCircle className='w-8 h-8 mb-2' />
          <p className='font-semibold'>Error al cargar</p>
        </div>
      )
    }
    if (chartData.length === 0) {
      return (
        <div className='h-[240px] flex items-center justify-center'>
          <p className='text-slate-500'>No hay ventas en este período.</p>
        </div>
      )
    }
    return (
      <>
        <div className='flex items-center  mt-4'>
          <div className='w-1/2 flex-shrink-0 cursor-pointer'>
            <ApexChart
              options={chartOptions}
              series={chartData.map(d => d.value)}
              type='donut'
              height={180}
            />
          </div>
          <div className='w-1/2 flex-grow space-y-2'>
            {chartData.map(slice => (
              <div
                key={slice.name}
                onClick={() => setSelectedSlice(slice)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  selectedSlice?.name === slice.name ? 'bg-slate-100' : ''
                }`}
              >
                <div className='flex items-center gap-3'>
                  <span
                    className='w-1 h-6  rounded-sm'
                    style={{ backgroundColor: slice.color }}
                  ></span>
                  <div className='flex flex-col'>
                    <span className='text-slate-500 font-light text-small'>
                      {slice.name}
                    </span>
                    <div className='flex justify-between w-full text-sm'>
                      <span className='font-bold text-slate-800 whitespace-nowrap'>
                        {metricFilter === 'price'
                          ? convertToArgentinePeso(slice.value)
                          : `${Math.round(slice.value)} u.`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <CardWithShadow>
      <div className='p-6'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-slate-800'>
              Top Clientes
            </h3>
            <p className='text-xs text-slate-400'>
              Por {metricFilter === 'price' ? 'Facturación' : 'Cantidad'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              onPress={handleCsvExport}
              isDisabled={isDownloading || loading || chartData.length === 0}
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
              size='sm'
              onPress={() => setTimeFilter('month')}
              className={`transition-colors flex-1 ${
                timeFilter === 'month'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Mes
            </Button>
            <Button
              size='sm'
              onPress={() => setTimeFilter('year')}
              className={`transition-colors flex-1 ${
                timeFilter === 'year'
                  ? 'bg-slate-800 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              Año
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

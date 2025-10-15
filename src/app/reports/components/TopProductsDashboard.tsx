'use client'

import { useState, useMemo } from 'react'
import { CardBody, Chip, Button } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { RefreshCw } from 'lucide-react'

// --- Interfaces y Datos de Ejemplo (sin cambios) ---
interface Sale {
  productName: string
  quantitySold: number
  price: number
  saleDate: Date
}

const mockSales: Sale[] = [
  // Semana actual
  {
    productName: 'Tomate Cherry',
    quantitySold: 50,
    price: 5.5,
    saleDate: new Date(),
  },
  {
    productName: 'Lechuga Morada',
    quantitySold: 30,
    price: 3.0,
    saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    productName: 'Zanahoria Baby',
    quantitySold: 80,
    price: 2.5,
    saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    productName: 'Albahaca Fresca',
    quantitySold: 25,
    price: 4.0,
    saleDate: new Date(),
  },
  {
    productName: 'Espinaca',
    quantitySold: 5,
    price: 2.0,
    saleDate: new Date(),
  }, // Producto con pocas ventas
  // Mes actual
  {
    productName: 'Rúcula Selvática',
    quantitySold: 150,
    price: 3.5,
    saleDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    productName: 'Puerro',
    quantitySold: 10,
    price: 1.8,
    saleDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }, // Producto con pocas ventas
  // Año actual
  {
    productName: 'Papa Negra',
    quantitySold: 500,
    price: 1.5,
    saleDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
]

type TimeFilter = 'day' | 'week' | 'month'
type MetricFilter = 'quantity' | 'price'
type SortOrder = 'top' | 'bottom' // ✨ Nuevo tipo para el orden

export default function TogglableProductsDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('quantity')
  const [sortOrder, setSortOrder] = useState<SortOrder>('top') // ✨ Nuevo estado para el orden

  const rankedProducts = useMemo(() => {
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000

    const salesInPeriod = mockSales.filter(sale => {
      const diffInMillis = now.getTime() - sale.saleDate.getTime()
      const diffInDays = Math.floor(diffInMillis / oneDayInMillis)

      if (timeFilter === 'day' && diffInDays > 0) return false
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false
      return true
    })

    const aggregated = salesInPeriod.reduce((acc, sale) => {
      if (!acc[sale.productName]) {
        acc[sale.productName] = { totalQuantity: 0, totalPrice: 0 }
      }
      acc[sale.productName].totalQuantity += sale.quantitySold
      acc[sale.productName].totalPrice += sale.quantitySold * sale.price
      return acc
    }, {} as Record<string, { totalQuantity: number; totalPrice: number }>)

    // ✨ Lógica de ordenamiento ahora depende de 'sortOrder'
    const sorted = Object.entries(aggregated)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const valueA = metricFilter === 'price' ? a.totalPrice : a.totalQuantity
        const valueB = metricFilter === 'price' ? b.totalPrice : b.totalQuantity

        return sortOrder === 'top' ? valueB - valueA : valueA - valueB
      })

    return sorted.slice(0, 5)
  }, [timeFilter, metricFilter, sortOrder]) // ✨ 'sortOrder' ahora es una dependencia

  const maxValue =
    rankedProducts.length > 0
      ? metricFilter === 'price'
        ? Math.max(...rankedProducts.map(p => p.totalPrice))
        : Math.max(...rankedProducts.map(p => p.totalQuantity))
      : 1

  const formatCurrency = (value: number) =>
    `$${new Intl.NumberFormat('es-AR').format(value)}`

  const handleToggleSortOrder = () => {
    setSortOrder(prev => (prev === 'top' ? 'bottom' : 'top'))
  }

  return (
    <CardWithShadow>
      <CardBody className='p-4 md:p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-slate-800'>
            {/* ✨ Título dinámico */}
            Top 5 {sortOrder === 'top' ? 'Más' : 'Menos'} Vendidos
          </h3>
          {/* ✨ Botón para cambiar el orden */}
          <Button
            size='sm'
            variant='flat'
            onClick={handleToggleSortOrder}
            startContent={<RefreshCw size={14} />}
          >
            Ver {sortOrder === 'top' ? 'Menos' : 'Más'}
          </Button>
        </div>

        {/* --- Filtros (sin cambios) --- */}
        <div className='flex flex-col gap-4 mb-4'>
          <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full'>
            <Chip
              onClick={() => setTimeFilter('day')}
              variant={timeFilter === 'day' ? 'solid' : 'flat'}
              className='cursor-pointer w-full justify-center'
            >
              Hoy
            </Chip>
            <Chip
              onClick={() => setTimeFilter('week')}
              variant={timeFilter === 'week' ? 'solid' : 'flat'}
              className='cursor-pointer w-full justify-center'
            >
              Semana
            </Chip>
            <Chip
              onClick={() => setTimeFilter('month')}
              variant={timeFilter === 'month' ? 'solid' : 'flat'}
              className='cursor-pointer w-full justify-center'
            >
              Mes
            </Chip>
          </div>
          <div className='flex justify-between items-center bg-slate-100 p-1 rounded-full'>
            <Chip
              onClick={() => setMetricFilter('quantity')}
              variant={metricFilter === 'quantity' ? 'solid' : 'flat'}
              className='cursor-pointer w-full justify-center'
            >
              Cantidad
            </Chip>
            <Chip
              onClick={() => setMetricFilter('price')}
              variant={metricFilter === 'price' ? 'solid' : 'flat'}
              className='cursor-pointer w-full justify-center'
            >
              Precio
            </Chip>
          </div>
        </div>

        {/* --- Lista de Productos --- */}
        <div className='space-y-4'>
          {rankedProducts.length > 0 ? (
            rankedProducts.map((product, index) => (
              <div key={product.name}>
                <div className='flex justify-between items-center mb-1'>
                  <p className='text-sm font-medium text-slate-600'>
                    <span className='font-bold'>{index + 1}.</span>{' '}
                    {product.name}
                  </p>
                  <p className='text-sm font-semibold text-slate-800'>
                    {metricFilter === 'price'
                      ? formatCurrency(product.totalPrice)
                      : `${product.totalQuantity} u.`}
                  </p>
                </div>
                <div className='w-full bg-slate-200 rounded-full h-2.5'>
                  <div
                    // ✨ Color de barra dinámico
                    className={`h-2.5 rounded-full ${
                      sortOrder === 'top'
                        ? metricFilter === 'price'
                          ? 'bg-green-500'
                          : 'bg-primary'
                        : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${
                        ((metricFilter === 'price'
                          ? product.totalPrice
                          : product.totalQuantity) /
                          maxValue) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-6'>
              <p className='text-slate-500'>No hay ventas en este período.</p>
            </div>
          )}
        </div>
      </CardBody>
    </CardWithShadow>
  )
}

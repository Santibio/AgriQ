'use client'

import { useState, useEffect } from 'react'
import { Button, CardBody } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { ChevronRight } from 'lucide-react'

// 1. Definimos el tipo de datos que recibirá el componente
interface ChartDataItem {
  label: string
  value: number
  color: string // Color de la barra con clases de Tailwind (ej: 'bg-blue-500')
}

// Datos de ejemplo con productos diferentes
const marketStockData: ChartDataItem[] = [
  { label: 'Tomate Cherry', value: 1500, color: 'bg-green-500' },
  { label: 'Lechuga Morada', value: 800, color: 'bg-teal-500' },
  { label: 'Rúcula', value: 650, color: 'bg-lime-500' },
  { label: 'Menta Fresca', value: 300, color: 'bg-emerald-500' },
];

const warehouseStockData: ChartDataItem[] = [
  { label: 'Albahaca Fresca', value: 343, color: 'bg-cyan-500' },
  { label: 'Puerro', value: 302, color: 'bg-sky-500' },
  { label: 'Espinaca', value: 720, color: 'bg-green-600' },
  { label: 'Tomate Cherry', value: 988, color: 'bg-green-500' }, // Producto en común
];

// Lógica mejorada para combinar datos
const allLabels = Array.from(new Set([...marketStockData.map(i => i.label), ...warehouseStockData.map(i => i.label)]));
const colorMap = new Map([...marketStockData, ...warehouseStockData].map(i => [i.label, i.color]));

const combinedStockData: ChartDataItem[] = allLabels.map(label => {
  const marketValue = marketStockData.find(i => i.label === label)?.value || 0;
  const warehouseValue = warehouseStockData.find(i => i.label === label)?.value || 0;
  return {
    label,
    value: marketValue + warehouseValue,
    color: colorMap.get(label) || 'bg-gray-500',
  };
}).sort((a, b) => b.value - a.value); // Ordenar de mayor a menor


// --- Componente principal que puedes usar en tu página ---

export default function StockDistribution() {
  const [filter, setFilter] = useState('ambos'); // 'mercado', 'deposito', 'ambos'
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  const dataMap = {
    mercado: marketStockData.sort((a, b) => b.value - a.value),
    deposito: warehouseStockData.sort((a, b) => b.value - a.value),
    ambos: combinedStockData,
  };

  const currentData = dataMap[filter as keyof typeof dataMap];
  const maxValue = Math.max(...currentData.map(item => item.value));

  useEffect(() => {
    // Inicia con valores en 0 para la animación
    setChartData(currentData.map(item => ({ ...item, value: 0 })));

    const timer = setTimeout(() => {
      // Actualiza a los valores reales para que la barra crezca
      setChartData(currentData);
    }, 100);

    return () => clearTimeout(timer);
  }, [filter, currentData]); // Se ejecuta cada vez que el filtro cambia

  return (
    <CardWithShadow>
      <CardBody>
        <div className='flex justify-between'>
          <div className='flex justify-between mb-4 flex-col gap-4'>
            <h3 className='text-lg font-semibold text-slate-800'>
              Stock de Productos
            </h3>
            <div className='flex gap-2'>
              <button onClick={() => setFilter('mercado')} className={`px-3 py-1 text-sm rounded-md ${filter === 'mercado' ? 'bg-slate-800 text-white' : 'bg-slate-200'}`}>Mercado</button>
              <button onClick={() => setFilter('deposito')} className={`px-3 py-1 text-sm rounded-md ${filter === 'deposito' ? 'bg-slate-800 text-white' : 'bg-slate-200'}`}>Depósito</button>
              <button onClick={() => setFilter('ambos')} className={`px-3 py-1 text-sm rounded-md ${filter === 'ambos' ? 'bg-slate-800 text-white' : 'bg-slate-200'}`}>Ambos</button>
            </div>
          </div>
          <Button isIconOnly variant='flat' size='sm'>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
        <div className='space-y-4'>
          {chartData.map(item => (
            <div key={item.label} className='group'>
              <div className='flex justify-between items-center mb-1'>
                <p className='text-sm font-medium text-slate-600'>
                  {item.label}
                </p>
                <p className='text-sm font-semibold text-slate-800'>
                  {currentData.find(p => p.label === item.label)?.value} u.
                </p>
              </div>
              <div className='w-full bg-slate-200 rounded-full h-4 overflow-hidden'>
                <div
                  className={`h-4 rounded-full transition-all ease-out duration-1000 group-hover:opacity-80 ${item.color}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </CardWithShadow>
  )
}
'use client'

import { useState, useMemo, useEffect } from 'react'
import { CardBody, Chip, Input, Button } from '@heroui/react'
import CardWithShadow from '@/components/card-with-shadow'
import { Search, Download, FileText } from 'lucide-react'
import { CSVLink } from 'react-csv'
import { PDFDownloadLink } from '@react-pdf/renderer'
import BatchReportPDF from './BatchReportPDF' // Asegúrate de que la ruta sea correcta

// --- Interfaces y Datos de Ejemplo (sin cambios) ---
interface Product {
  name: string
}
interface Batch {
  id: number
  product: Product
  initialQuantity: number
  createdAt: Date
}
const mockBatches: Batch[] = [
  {
    id: 101,
    product: { name: 'Tomate Cherry' },
    initialQuantity: 250,
    createdAt: new Date(),
  },
  {
    id: 102,
    product: { name: 'Lechuga Morada' },
    initialQuantity: 150,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 103,
    product: { name: 'Albahaca Fresca' },
    initialQuantity: 80,
    createdAt: new Date(),
  },
]

export default function ProductionReportWithDownloads() {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Este estado es crucial para que PDFDownloadLink solo se renderice en el cliente
    setIsClient(true)
  }, [])

  const filteredBatches = useMemo(() => {
    // ... (lógica de filtrado sin cambios)
    const now = new Date()
    const oneDayInMillis = 24 * 60 * 60 * 1000
    return mockBatches.filter(batch => {
      const searchMatch = batch.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      if (!searchMatch) return false
      const diffInDays = Math.floor(
        (now.getTime() - batch.createdAt.getTime()) / oneDayInMillis,
      )
      if (timeFilter === 'day' && diffInDays > 0) return false
      if (timeFilter === 'week' && diffInDays > 7) return false
      if (timeFilter === 'month' && diffInDays > 30) return false
      return true
    })
  }, [searchTerm, timeFilter])

  // --- ✨ Preparación de datos para ambos reportes ---
  const csvHeaders = [
    { label: 'ID Lote', key: 'id' },
    { label: 'Producto', key: 'product.name' },
    { label: 'Cantidad Producida', key: 'initialQuantity' },
    { label: 'Fecha de Creación', key: 'createdAt' },
  ]

  const reportData = filteredBatches.map(batch => ({
    ...batch,
    createdAt: batch.createdAt.toISOString().slice(0, 10), // Formato YYYY-MM-DD
  }))

  return (
    <div className='max-w-md w-full'>
      <CardWithShadow>
        <CardBody className='p-4 md:p-6'>
          <h3 className='text-lg font-semibold text-slate-800 mb-4'>
            Descarga de Reportes
          </h3>
          {/* --- Filtros y Lista (sin cambios) --- */}

          {/* --- ✨ Botones de Descarga --- */}
          <div className='mt-4 flex flex-col sm:flex-row gap-3'>
            {/* Botón de Descarga CSV */}
            <CSVLink
              data={reportData}
              headers={csvHeaders}
              filename={`reporte_lotes_csv_${new Date()
                .toISOString()
                .slice(0, 10)}.csv`}
              className='w-full'
            >
              <Button
                variant='flat'
                color='primary'
                className='w-full'
                startContent={<Download size={16} />}
              >
                Descargar CSV
              </Button>
            </CSVLink>

            {/* Botón de Descarga PDF */}
            {isClient && ( // Renderiza el link solo en el cliente
              <PDFDownloadLink
                document={<BatchReportPDF batches={reportData} />}
                fileName={`reporte_lotes_pdf_${new Date()
                  .toISOString()
                  .slice(0, 10)}.pdf`}
                className='w-full'
              >
                {({ loading }) => (
                  <Button
                    variant='flat'
                    color='danger'
                    className='w-full'
                    startContent={<FileText size={16} />}
                    isDisabled={loading}
                  >
                    {loading ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </CardBody>
      </CardWithShadow>
    </div>
  )
}

import { CardBody, Chip, Link } from '@heroui/react'
import {
  AlertTriangle,
  ArrowUpLeft,
  CheckCircle2,
  MoveRight,
  Package,
  PackagePlus,
} from 'lucide-react'
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Shipment,
  Location,
} from '@prisma/client'
import paths from '@/lib/paths'
import { JSX } from 'react'
import { capitalize } from '@/lib/utils'
import EmptyListMsg from '@/components/empty-list'
import { timeAgo } from '@/lib/helpers/date'
import CardWithShadow from '@/components/card-with-shadow'
import { Color } from '@/lib/schemas/general'

// --- Tipos y Mapeos (Mejorados para más claridad) ---

interface ShipmentsListProps {
  list: ShipmentWithRelations[]
}

type ShipmentWithRelations = Shipment & {
  // Asumo que origin y destination están en el modelo Shipment
  origin: string
  destination: string
  movement: Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product
      }
    })[]
  }
}

interface ChipProps {
  color: Color
  variant: 'light' | 'flat'
  size: 'sm' | 'md' | 'lg'
  label: string
}

// Colores para los tipos de producto (provisto por ti)
const typeColors: Record<string, Omit<ChipProps, 'label'>> = {
  secas: { color: 'primary', variant: 'flat', size: 'sm' },
  frescas: { color: 'success', variant: 'flat', size: 'sm' },
  deHoja: { color: 'secondary', variant: 'flat', size: 'sm' },
  tuberculosRaices: { color: 'danger', variant: 'flat', size: 'sm' },
  varios: { color: 'warning', variant: 'flat', size: 'sm' },
}
const defaultTypeColor = { color: 'default', variant: 'flat', size: 'sm' }

// Se añade 'label' y 'color' para el Chip del estado
const STATUS_MAP: Record<
  Shipment['status'],
  { icon: JSX.Element; label: string; color: Color }
> = {
  PENDING: {
    // Icono: Un paquete recién creado/sellado. Representa el lote listo para salir.
    // Alternativa: <Send className='h-4 w-4' /> (avión de papel, más orientado al envío).
    icon: <PackagePlus className='h-4 w-4' />,
    label: 'Pendiente de Envío',
    color: 'warning',
  },
  RECEIVED_OK: {
    // Icono: Un círculo con un check. Es el símbolo universal de "completado exitosamente".
    // Más claro y estándar que el doble check.
    icon: <CheckCircle2 className='h-4 w-4' />,
    label: 'Recibido Correctamente',
    color: 'success',
  },
  RECEIVED_NO_OK: {
    // Icono: Triángulo de advertencia. Comunica perfectamente "llegó, pero hay un problema".
    // No es un error total (X), sino una alerta que requiere atención.
    icon: <AlertTriangle className='h-4 w-4' />,
    label: 'Recibido con discrepancia',
    color: 'danger',
  },
  RETURNED: {
    // Icono: Flecha de retorno (U-turn). Describe visualmente la acción de volver al origen.
    // Es mucho más preciso que una "X" y diferencia claramente este estado de un error.
    icon: <ArrowUpLeft className='h-4 w-4' />,
    label: 'Devuelto a Depósito',
    color: 'default', // Se sugiere un color neutro como 'default' o 'secondary' ya que no es un error.
  },
}

const destinationMap: Record<Location, string> = {
  DEPOSIT: 'Depósito',
  MARKET: 'Mercado',
}

// --- Componente Principal ---

export default function ShipmentsList({ list }: ShipmentsListProps) {
  // Límite de productos a mostrar antes de agrupar
  const MAX_PRODUCTS_VISIBLE = 3

  if (!list || list.length === 0) {
    return <EmptyListMsg text='No hay envíos para mostrar' />
  }


  return (
    <ul className='flex flex-col gap-4'>
      {list.map(shipment => {
        const statusInfo = STATUS_MAP[shipment.status]
        const products = shipment.movement.movementDetail
        const visibleProducts = products.slice(0, MAX_PRODUCTS_VISIBLE)
        const hiddenProductsCount = products.length - visibleProducts.length

        return (
          <li key={shipment.id}>
            <Link
              href={paths.shipmentEdit(shipment.id.toString())}
              className='w-full'
            >
              <CardWithShadow isPressable>
                {/* Usamos flex-col para estructurar la tarjeta en secciones verticales */}
                <CardBody className='flex flex-col gap-4 p-4'>
                  {/* === SECCIÓN 1: ENCABEZADO (ID y ESTADO) === */}
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='text-lg font-bold text-slate-800'>{`Envío #${shipment.id}`}</h3>
                      <p className='text-xs text-slate-500'>
                        {timeAgo(shipment?.createdAt)}
                      </p>
                    </div>
                    <Chip
                      color={statusInfo.color}
                      variant='solid'
                      size='sm'
                      startContent={statusInfo.icon}
                    >
                      {statusInfo.label}
                    </Chip>
                  </div>

                  {/* === SECCIÓN 2: RUTA (ORIGEN Y DESTINO) - LAYOUT HORIZONTAL === */}
                  <div className='flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 sm:gap-4'>
                    {/* --- Origen --- */}
                    <div className='flex-1'>
                      <p className='truncate text-xs text-slate-500'>Origen</p>
                      <p className='truncate font-medium text-slate-700'>
                        {destinationMap[shipment.origin]}
                      </p>
                    </div>

                    {/* --- Conector Visual --- */}
                    <div className='flex-shrink-0 rounded-full bg-white p-2 shadow-sm'>
                      <MoveRight className='h-5 w-5 text-slate-500' />
                    </div>

                    {/* --- Destino --- */}
                    <div className='flex-1 text-right'>
                      <p className='truncate text-xs text-slate-500'>Destino</p>
                      <p className='truncate font-medium text-slate-700'>
                        {destinationMap[shipment.destination]}
                      </p>
                    </div>
                  </div>

                  {/* === SECCIÓN 3: PRODUCTOS (LISTA INTELIGENTE) === */}
                  <div>
                    <div className='mb-2 flex items-center gap-2'>
                      <Package className='h-4 w-4 text-slate-500' />
                      <h4 className='text-sm font-semibold text-slate-600'>
                        Productos
                      </h4>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {visibleProducts.map(detail => {
                        const product = detail.batch.product
                        // Asigna color por tipo o un color por defecto si no se encuentra
                        const chipStyle =
                          typeColors[product.type] || defaultTypeColor
                        return (
                          <Chip
                            key={detail.id}
                            color={chipStyle.color}
                            variant={chipStyle.variant}
                            size={chipStyle.size}
                          >
                            {`${capitalize(product.name)} x${detail.quantity}`}
                          </Chip>
                        )
                      })}
                      {hiddenProductsCount > 0 && (
                        <Chip size='sm' color='default' variant='flat'>
                          +{hiddenProductsCount} más...
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardBody>
              </CardWithShadow>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

import { CardBody, Chip, Link } from '@heroui/react'
import { Package } from 'lucide-react'
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Shipment,
} from '@prisma/client'
import paths from '@/lib/paths'
import { capitalize } from '@/lib/utils'
import EmptyListMsg from '@/components/empty-list'
import { timeAgo } from '@/lib/helpers/date'
import CardWithShadow from '@/components/card-with-shadow'
import { Color } from '@/lib/schemas/general'

interface ShipmentsListProps {
  list: ShipmentWithRelations[]
}

type ShipmentWithRelations = Shipment & {
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

export default function ShipmentsList({ list }: ShipmentsListProps) {
  // Límite de productos a mostrar antes de agrupar
  const MAX_PRODUCTS_VISIBLE = 3

  if (!list || list.length === 0)
    return <EmptyListMsg text='No hay envíos para recibir' />

  return (
    <ul className='flex flex-col gap-4'>
      {list.map(shipment => {
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

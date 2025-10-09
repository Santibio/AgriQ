'use client'
import { Product } from '@prisma/client'
import { CardBody, Image, Chip } from '@heroui/react'
import Link from 'next/link'
import paths from '@/lib/paths'
import EmptyListMsg from '@/components/empty-list'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import { Color } from '@/lib/schemas/general'
import CardWithShadow from '@/components/card-with-shadow'

interface ProductsListProps {
  products: Product[]
}

// Interfaz para las propiedades del Chip, para mayor claridad
interface ChipProps {
  color: Color
  variant: 'light' | 'flat'
  size: 'sm' | 'md' | 'lg'
  label: string
}

// Mapeo de configuraciones para los chips de categoría
const categoryColors: Record<string, ChipProps> = {
  aromaticas: {
    color: 'primary',
    variant: 'flat',
    size: 'sm',
    label: 'Aromáticas',
  },
  hortalizas: {
    color: 'success',
    variant: 'flat',
    size: 'sm',
    label: 'Hortalizas',
  },
}

// Mapeo de configuraciones para los chips de tipo de producto
const typeColors: Record<string, ChipProps> = {
  secas: { color: 'primary', variant: 'light', size: 'sm', label: 'Secas' },
  frescas: { color: 'success', variant: 'light', size: 'sm', label: 'Frescas' },
  deHoja: {
    color: 'secondary',
    variant: 'light',
    size: 'sm',
    label: 'De Hoja',
  },
  tuberculosRaices: {
    color: 'danger',
    variant: 'light',
    size: 'sm',
    label: 'Tubérculos y Raíces',
  },
  varios: { color: 'warning', variant: 'light', size: 'sm', label: 'Varios' },
}

export default function ProductsList({ products }: ProductsListProps) {
  if (!products.length) {
    return <EmptyListMsg text='No hay productos disponibles.' />
  }

  return (
    <ul className='flex flex-col gap-3'>
      {products.map(product => {
        // Obtenemos las propiedades de los chips para un código más limpio
        const categoryChipProps =
          categoryColors[product.category as keyof typeof categoryColors]
        const typeChipProps =
          typeColors[product.type as keyof typeof typeColors]

        return (
          <li key={product.id} className='w-full'>
            <Link
              href={paths.productEdit(product.id.toString())}
              className='w-full'
            >
              <CardWithShadow isPressable isDisabled={!product.active}>
                <CardBody className='p-3'>
                  {/* Usamos Grid para la estructura principal: [Imagen] [Contenido] */}
                  <div className='grid grid-cols-[auto_1fr] items-start gap-4'>
                    <Image
                      alt={product.name}
                      src={product.image}
                      className='h-20 w-20 rounded-lg object-cover'
                    />
                    {/* Contenedor para toda la información a la derecha */}
                    <div className='flex h-full flex-col'>
                      {/* Sección Superior: Nombre y Precio */}
                      <div className='flex items-start justify-between'>
                        <h4 className='text-md font-bold capitalize'>
                          {product.name}
                        </h4>
                        <p className='text-md whitespace-nowrap font-semibold'>
                          {convertToArgentinePeso(product.price)}
                        </p>
                      </div>

                      {/* Sección Media: Chips de Categoría y Tipo */}
                      <div className='mt-1 flex flex-wrap gap-2'>
                        {categoryChipProps && (
                          <Chip {...categoryChipProps} className='capitalize'>
                            {categoryChipProps.label}
                          </Chip>
                        )}
                        {typeChipProps && (
                          <Chip {...typeChipProps} className='capitalize'>
                            {typeChipProps.label}
                          </Chip>
                        )}
                      </div>

                      {/* Sección Inferior: Código y Estado (se alinea abajo) */}
                      <div className='mt-auto flex items-center justify-between pt-1'>
                        <p className='text-xs text-slate-500'>
                          Código: {product.code}
                        </p>
                        <Chip
                          color={product.active ? 'success' : 'danger'}
                          variant='light'
                          size='sm'
                        >
                          {product.active ? 'Activo' : 'Inactivo'}
                        </Chip>
                      </div>
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

'use client'
import { Product } from '@prisma/client'
import {
  CardBody,
  Image,
  Chip,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  RadioGroup,
  Radio,
  useDisclosure,
} from '@heroui/react'
import Link from 'next/link'
import paths from '@/lib/paths'
import EmptyListMsg from '@/components/empty-list'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import { Color } from '@/lib/schemas/general'
import CardWithShadow from '@/components/card-with-shadow'
import { Search } from '@/components/search'
import { useMemo, useState } from 'react'
import { ListFilter } from 'lucide-react'

interface ProductsListProps {
  products: Product[]
}

type SortByType = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'
type StatusFilterType = 'all' | 'active' | 'inactive'
type CategoryFilterType = 'all' | Product['category']
type TypeFilterType = 'all' | Product['type']

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  const [activeSortBy, setActiveSortBy] = useState<SortByType>('name-asc')
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<StatusFilterType>('all')
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<CategoryFilterType>('all')
  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilterType>('all')

  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<StatusFilterType>(activeStatusFilter)
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<CategoryFilterType>(activeCategoryFilter)
  const [selectedTypeFilter, setSelectedTypeFilter] =
    useState<TypeFilterType>(activeTypeFilter)

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowercasedFilter),
      )
    }

    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(
        product =>
          (activeStatusFilter === 'active' && product.active) ||
          (activeStatusFilter === 'inactive' && !product.active),
      )
    }

    if (activeCategoryFilter !== 'all') {
      filtered = filtered.filter(
        product => product.category === activeCategoryFilter,
      )
    }

    if (activeTypeFilter !== 'all') {
      filtered = filtered.filter(product => product.type === activeTypeFilter)
    }

    switch (activeSortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    return filtered
  }, [
    products,
    searchTerm,
    activeSortBy,
    activeStatusFilter,
    activeCategoryFilter,
    activeTypeFilter,
  ])

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedStatusFilter(activeStatusFilter)
    setSelectedCategoryFilter(activeCategoryFilter)
    setSelectedTypeFilter(activeTypeFilter)
    onOpen()
  }

  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveStatusFilter(selectedStatusFilter)
    setActiveCategoryFilter(selectedCategoryFilter)
    setActiveTypeFilter(selectedTypeFilter)
    onOpenChange()
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatusFilter(value as StatusFilterType)
  }

  const handleCategoryFilterChange = (value: string) => {
    setSelectedCategoryFilter(value as CategoryFilterType)
  }

  const handleTypeFilterChange = (value: string) => {
    setSelectedTypeFilter(value as TypeFilterType)
  }
  if (!products.length) {
    return <EmptyListMsg text='No hay productos para mostrar.' />
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Search
            placeholder='Buscar por nombre de producto'
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            className='flex-1'
          />
          <Button
            variant='flat'
            color='primary'
            isIconOnly
            onPress={handleOpenDrawer}
          >
            <ListFilter className='w-5 h-5' />
          </Button>
        </div>
        <ul className='flex flex-col gap-3'>
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map(product => {
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
                              <Chip
                                {...categoryChipProps}
                                className='capitalize'
                              >
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
          })
        ) : (
          <EmptyListMsg text='No se encontraron productos con esos Búsqueda.' />
        )}
      </ul>
      </div>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop='blur'
        placement='bottom'
        size='2xl'
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>Búsqueda y Ordenamiento</h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div className='flex flex-col gap-6'>
                  <RadioGroup
                    label='Ordenar por'
                    value={selectedSortBy}
                    onValueChange={handleSortByChange}
                  >
                    <Radio value='name-asc'>Nombre (A-Z)</Radio>
                    <Radio value='name-desc'>Nombre (Z-A)</Radio>
                    <Radio value='price-asc'>Menor precio</Radio>
                    <Radio value='price-desc'>Mayor precio</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Buscar por estado'
                    value={selectedStatusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    <Radio value='active'>Activos</Radio>
                    <Radio value='inactive'>Inactivos</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Buscar por categoría'
                    value={selectedCategoryFilter}
                    onValueChange={handleCategoryFilterChange}
                  >
                    <Radio value='all'>Todas</Radio>
                    {Object.entries(categoryColors).map(([key, { label }]) => (
                      <Radio key={key} value={key}>
                        {label}
                      </Radio>
                    ))}
                  </RadioGroup>

                  <RadioGroup
                    label='Buscar por tipo'
                    value={selectedTypeFilter}
                    onValueChange={handleTypeFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    {Object.entries(typeColors).map(([key, { label }]) => (
                      <Radio key={key} value={key}>
                        {label}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  color='primary'
                  className='w-full'
                  onPress={handleApplyFilters}
                >
                  Aplicar
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

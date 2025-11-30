'use client'

import { Product, Batch } from '@prisma/client'
import {
  Button,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Image,
  Radio,
  RadioGroup,
  useDisclosure,
} from '@heroui/react'
import { capitalize } from '@/lib/helpers/text'
import EmptyListMsg from '@/components/empty-list'
import Link from 'next/link'
import paths from '@/lib/paths'
import { timeAgo } from '@/lib/helpers/date'
import CardWithShadow from '@/components/card-with-shadow'
import { useMemo, useState } from 'react'
import { Search } from '@/components/search'
import { ListFilter } from 'lucide-react'
import moment from 'moment'

interface ProductionsListProps {
  productions: ProductionWithRelations[]
}

type ProductionWithRelations = Batch & {
  product: Product
}

type SortByType =
  | 'date-desc'
  | 'date-asc'
  | 'quantity-desc'
  | 'quantity-asc'
  | 'name-desc'
  | 'name-asc'
type DateFilterType = 'all' | '7days' | '30days'

export default function ProductionsList({ productions }: ProductionsListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // --- Estado para Búsqueda (en vivo) ---
  const [searchTerm, setSearchTerm] = useState('')

  // --- Estado "Activo" (el que filtra la lista) ---
  const [activeSortBy, setActiveSortBy] = useState<SortByType>('date-desc')
  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterType>('all')

  // --- Estado "Seleccionado" (temporal, para el drawer) ---
  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilterType>(activeDateFilter)

  // El hook useMemo ahora depende del estado "Activo" y del "searchTerm"
  const filteredAndSortedProductions = useMemo(() => {
    let filtered = [...productions]

    // --- 1. Aplicar Filtro de Búsqueda (en vivo) ---
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase()
      filtered = filtered.filter(production => {
        const productName = production.product.name.toLowerCase()
        const lotNumber = production.id.toString()

        return (
          productName.includes(lowercasedFilter) ||
          lotNumber.includes(lowercasedFilter)
        )
      })
    }

    // --- 2. Aplicar Filtro de Fecha "Activo" ---
    if (activeDateFilter !== 'all') {
      const cutOffDate =
        activeDateFilter === '7days'
          ? moment().subtract(7, 'days')
          : activeDateFilter === '30days'
          ? moment().subtract(30, 'days')
          : null

      if (cutOffDate) {
        filtered = filtered.filter(p =>
          moment(p.createdAt).isSameOrAfter(cutOffDate),
        )
      }
    }

    // --- 3. Aplicar Ordenamiento "Activo" ---
    switch (activeSortBy) {
      case 'date-desc':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case 'date-asc':
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        break
      case 'name-desc':
        filtered.sort((a, b) => b.product.name.localeCompare(a.product.name))
        break
      case 'name-asc':
        filtered.sort((a, b) => a.product.name.localeCompare(b.product.name))
        break
      case 'quantity-desc':
        filtered.sort((a, b) => b.initialQuantity - a.initialQuantity)
        break
      case 'quantity-asc':
        filtered.sort((a, b) => a.initialQuantity - b.initialQuantity)
        break
      default:
        break
    }

    return filtered
  }, [productions, searchTerm, activeSortBy, activeDateFilter]) // Dependencias actualizadas

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  // Al abrir el drawer, sincroniza el estado "seleccionado" con el "activo"
  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedDateFilter(activeDateFilter)
    onOpen()
  }

  // Al aplicar, transfiere el estado "seleccionado" al "activo" y cierra
  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveDateFilter(selectedDateFilter)
    onOpenChange() // Cierra el drawer
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleDateFilterChange = (value: string) => {
    setSelectedDateFilter(value as DateFilterType)
  }

  if (!productions.length)
    return <EmptyListMsg text='No hay lotes disponibles.' />

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Search
            placeholder='Buscar por producto o número de lote'
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />
          {/* Botón de filtro ahora usa el handler personalizado */}
          <Button
            variant='flat'
            color='primary'
            isIconOnly
            onPress={handleOpenDrawer}
          >
            <ListFilter className='w-5 h-5' />
          </Button>
        </div>
        <ul className='flex gap-2 flex-col'>
          {filteredAndSortedProductions.map(production => (
            <li key={production.id}>
              <Link
                href={paths.productionEdit(production.id.toString())}
                className=' w-full'
              >
                <CardWithShadow isPressable>
                  <CardBody className='flex border rounded-md p-4 gap-4 flex-row'>
                    <Image
                      src={production.product.image}
                      alt={production.product.name}
                      width={60}
                      height={60}
                      className='object-cover rounded-md'
                    />
                    <div className='flex-1'>
                      {/* ... (contenido del card) ... */}
                      <div className='flex flex-col gap-1 justify-between'>
                        <div className='flex justify-between items-center'>
                          <span className='font-semibold text-xl'>{`Lote #${production.id}`}</span>
                          <span className='text-slate-500 text-sm'>
                            {timeAgo(production?.createdAt)}
                          </span>
                        </div>
                        <div className='flex gap-2 justify-between items-center'>
                          <span className='rounded-lg  text-slate-400 font-light'>
                            {capitalize(production.product.name)}
                          </span>
                          <span className='rounded-lg  text-slate-400 font-bold text-sm'>
                            x{production.initialQuantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </CardWithShadow>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange} // Permite cerrar al deslizar o tocar fuera
        backdrop='blur'
        placement='bottom'
        size='xl'
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>
                  Búsqueda y Ordenamiento
                </h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div className='flex flex-col gap-6'>
                  {/* Los RadioGroup ahora usan el estado "seleccionado" */}
                  <RadioGroup
                    label='Ordenar por'
                    value={selectedSortBy}
                    onValueChange={handleSortByChange}
                  >
                    <Radio value='date-desc'>Más recientes</Radio>
                    <Radio value='date-asc'>Más antiguos</Radio>
                    <Radio value='name-asc'>Nombre producto (A-Z)</Radio>
                    <Radio value='name-desc'>Nombre producto (Z-A)</Radio>
                    <Radio value='quantity-desc'>Mayor cantidad</Radio>
                    <Radio value='quantity-asc'>Menor cantidad</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Buscar por fecha'
                    value={selectedDateFilter}
                    onValueChange={handleDateFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    <Radio value='7days'>Últimos 7 días</Radio>
                    <Radio value='30days'>Últimos 30 días</Radio>
                  </RadioGroup>
                </div>
              </DrawerBody>
              <DrawerFooter>
                {/* El botón Aplicar ahora usa su handler personalizado */}
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

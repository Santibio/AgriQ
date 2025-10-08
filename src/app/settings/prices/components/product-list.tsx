'use client'

import { useMemo, useState } from 'react'
import { Product } from '@prisma/client'
import {
  Card,
  CardBody,
  NumberInput,
  Checkbox,
  Button,
  Chip,
  Input,
  ScrollShadow,
  useDisclosure,
} from '@heroui/react'
import { Search } from 'lucide-react'
import EmptyListMsg from '@/components/empty-list'
import FormWrapper from '@/components/layout/form-wrapper'
import FilterDrawer from './filter-drawer'
import { updateProductsPrices } from '../actions'
import { toast } from 'sonner'

interface ProductsListProps {
  products: Product[]
}

export default function ProductsList({ products }: ProductsListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Filters
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set())

  const toggleFilter = (id: string) => {
    setSelectedFilters(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const handleApplyFilters = () => {
    onOpenChange() // Cerrar el drawer de filtros

    // Si no hay filtros seleccionados, mostrar todos los productos
    if (selectedFilters.size === 0) {
      setFilteredProducts(products)
      return
    }

    // Convertir los filtros seleccionados a un array de objetos {category, type, presentation}
    const activeFilters = Array.from(selectedFilters).map(filterId => {
      const [category, type, presentation] = filterId.split('-')
      return { category, type, presentation }
    })

    // Filtrar los productos
    const filtered = products.filter(product => {
      return activeFilters.some(filter => {
        // Verificar coincidencia en cada propiedad del filtro
        const matchesCategory =
          !filter.category || product.category === filter.category
        const matchesType = !filter.type || product.type === filter.type
        const matchesPresentation =
          !filter.presentation || product.presentation === filter.presentation

        return matchesCategory && matchesType && matchesPresentation
      })
    })

    setFilteredProducts(filtered)
  }

  const handleCleanFilters = () => {
    setSelectedFilters(new Set())
    setFilteredProducts(products)
    onOpenChange()
  }
  // Selection
  const [selected, setSelected] = useState(new Set<number>())

  // Local prices
  const [localPrices, setLocalPrices] = useState<Record<string, number>>(
    Object.fromEntries(products.map(p => [p.id.toString(), p.price ?? 0])),
  )

  // Bulk price
  const [bulkPrice, setBulkPrice] = useState<number | undefined>()

  // Saving
  const [isLoading, setIsLoading] = useState(false)

  const toggleSelect = (id: number) => {
    let newSet = new Set(selected)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelected(newSet)
  }

  const applyBulkPrice = () => {
    if (!bulkPrice) return
    const updated = { ...localPrices }
    selected.forEach(id => {
      updated[id] = Number(bulkPrice)
    })
    setLocalPrices(updated)
  }

  const handleSearch = (value: string) => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(value.toLowerCase()),
    )
    setFilteredProducts(filtered)
  }

  const editedProducts = useMemo(
    () =>
      Object.entries(localPrices)
        .filter(([id, price]) => {
          const original = products.find(p => p.id.toString() === id)?.price
          return price !== original
        })
        .map(([id, price]) => ({ id: Number(id), price })),
    [localPrices],
  )

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateProductsPrices(editedProducts)
      toast.success('Precios actualizados correctamente')
      setSelected(new Set())
    } catch (err) {
      toast.error('Error al actualizar los precios.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <FormWrapper
        onSubmit={handleSave}
        buttonLabel={`Guardar cambios (${editedProducts.length})`}
        buttonProps={{
          isDisabled: editedProducts.length === 0 || isLoading,
          isLoading,
        }}
      >
        <Card
          className='flex flex-col gap-3 w-full bg-slate-50 p-4'
          shadow='none'
        >
          <div className='mb-2'>
            <Input
              placeholder='Buscar producto'
              isClearable
              startContent={<Search className='w-4 h-4' />}
              onValueChange={handleSearch}
            />
          </div>
          {/* Controles superiores */}
          <div className='flex items-center justify-between gap-2'>
            <Button
              color='primary'
              variant='flat'
              onPress={() =>
                setSelected(
                  selected.size
                    ? new Set()
                    : new Set(filteredProducts.map(p => p.id)),
                )
              }
              radius='sm'
              size='sm'
              className='flex-1'
            >
              {selected.size ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </Button>
            <Button
              color='secondary'
              variant='flat'
              radius='sm'
              size='sm'
              className='flex-1'
              onPress={onOpen}
            >
              {selectedFilters.size > 0
                ? `Filtros (${selectedFilters.size})`
                : 'Filtros'}
            </Button>
          </div>

          {/* Edición masiva */}
          <div className='flex items-center gap-2 mt-1'>
            <Input
              placeholder='Nuevo precio'
              value={bulkPrice?.toString()}
              min={0}
              radius='sm'
              className='flex-1'
              type='number'
              onValueChange={val => {
                if (isNaN(Number(val))) return
                setBulkPrice(Number(val))
              }}
              isClearable
              startContent={
                <div className='pointer-events-none flex items-center'>
                  <span className='text-default-400 text-small'>$</span>
                </div>
              }
            />

            <Button
              color='primary'
              onPress={applyBulkPrice}
              isDisabled={!selected.size || !bulkPrice}
              size='md'
              radius='sm'
              className='min-w-[110px] h-[-webkit-fill-available]'
            >
              Aplicar
            </Button>
          </div>

          {/* Indicador de selección */}
          {selected.size > 0 && (
            <div className='text-xs text-gray-500 text-center pt-1'>
              {selected.size} producto{selected.size !== 1 && 's'} seleccionado
            </div>
          )}
        </Card>

        {/* Lista de productos */}
        <div>
          <h3 className='text-md font-semibold mb-2 mt-5'>
            Lista de productos ({filteredProducts.length})
          </h3>
          {filteredProducts.length === 0 ? (
            <EmptyListMsg text='No hay productos disponibles.' />
          ) : (
            <ScrollShadow className='max-h-[46dvh]'>
              <ul className='flex flex-col gap-2 mt-2'>
                {filteredProducts.map(product => {
                  const id = product.id
                  const isSelected = selected.has(id)
                  const isModified = localPrices[id] !== product.price

                  return (
                    <li key={id}>
                      <Card
                        shadow='none'
                        className={`border rounded-xl w-full ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isModified
                            ? 'border-warning/40 bg-warning/5'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <CardBody className='flex justify-between gap-3 py-3 px-3 flex-row'>
                          {/* Izquierda: checkbox + nombre + chip */}
                          <div className='flex items-center gap-3 flex-1 min-w-0'>
                            <Checkbox
                              isSelected={isSelected}
                              onValueChange={() => toggleSelect(id)}
                              className='scale-110'
                            />
                            <div className='flex gap-1 truncate flex-col transition-all'>
                              <span className='font-semibold text-sm capitalize truncate text-gray-800'>
                                {product.name}
                              </span>
                              {isModified && (
                                <Chip
                                  color='warning'
                                  variant='flat'
                                  size='sm'
                                  className='h-5 text-xs font-medium w-fit'
                                >
                                  Precio Editado
                                </Chip>
                              )}
                            </div>
                          </div>

                          {/* Derecha: precio */}
                          <NumberInput
                            size='sm'
                            min={0}
                            value={localPrices[id]}
                            onChange={val =>
                              setLocalPrices(prev => ({
                                ...prev,
                                [id]: Number(val),
                              }))
                            }
                            className='w-[100px]'
                            hideStepper
                            startContent={
                              <div className='pointer-events-none flex items-center'>
                                <span className='text-default-400 text-small'>
                                  $
                                </span>
                              </div>
                            }
                          />
                        </CardBody>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            </ScrollShadow>
          )}
        </div>
      </FormWrapper>
      <FilterDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        handleApplyFilters={handleApplyFilters}
        handleCleanFilters={handleCleanFilters}
      />
    </>
  )
}

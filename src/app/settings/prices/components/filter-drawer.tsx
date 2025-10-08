'use client'

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Chip,
  Button,
} from '@heroui/react'
import config from '@/config'

interface FilterDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedFilters: Set<string>
  toggleFilter: (id: string) => void
  handleApplyFilters: () => void
  handleCleanFilters: () => void
}

export default function FilterDrawer({
  isOpen,
  onOpenChange,
  selectedFilters,
  toggleFilter,
  handleApplyFilters,
  handleCleanFilters,
}: FilterDrawerProps) {
  const isSelected = (id: string) => selectedFilters.has(id)

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement='bottom'
      backdrop='blur'
      size='2xl'
    >
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className='flex flex-col gap-1'>
              <h2 className='text-lg font-semibold'>Filtrar por categoría</h2>
              {selectedFilters.size > 0 && (
                <p className='text-sm text-gray-500'>
                  {selectedFilters.size} filtro{selectedFilters.size > 1 && 's'}{' '}
                  activo
                </p>
              )}
            </DrawerHeader>

            <DrawerBody className='space-y-6 pb-24'>
              {config.productCategories.map(category => (
                <div key={category.id} className='flex flex-col gap-3'>
                  <h3 className='font-semibold text-base text-gray-800'>
                    {category.label}
                  </h3>

                  {category.type.map(type => (
                    <div key={type.id}>
                      <p className='text-sm font-medium text-gray-600 mb-1'>
                        {type.label}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {type.presentation.map(pres => {
                          const id = `${category.id}-${type.id}-${pres.id}`
                          const selected = isSelected(id)

                          return (
                            <Chip
                              key={id}
                              color={selected ? type.color : 'default'}
                              variant={selected ? 'solid' : 'flat'}
                              size='md'
                              radius='sm'
                              className={`capitalize transition-all ${
                                selected
                                  ? 'shadow-sm scale-[1.03]'
                                  : 'opacity-80'
                              }`}
                              onClick={() => toggleFilter(id)}
                            >
                              {pres.label}
                            </Chip>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </DrawerBody>

            <div className='flex gap-2 p-4 border-t bg-white'>
              <Button
                fullWidth
                variant='flat'
                color='default'
                onPress={handleCleanFilters}
              >
                Limpiar
              </Button>
              <Button fullWidth color='primary' onPress={handleApplyFilters}>
                Aplicar
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

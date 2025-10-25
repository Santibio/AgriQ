'use client'

import type { Customer } from '@prisma/client'
import {
  Avatar,
  CardBody,
  Chip,
  Card,
  Divider,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  RadioGroup,
  Radio,
  useDisclosure,
} from '@nextui-org/react'
import Link from 'next/link'
import paths from '@/lib/paths'
import { ListFilter, Mail, Phone } from 'lucide-react'
import EmptyListMsg from '@/components/empty-list'
import { useMemo, useState } from 'react'
import { Search } from '@/components/search'
import { removeAccents } from '@/lib/helpers/text'

interface CustomerListProps {
  customers: Customer[]
}

type SortByType = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'
type StatusFilterType = 'all' | 'active' | 'inactive'
type FiscalConditionFilterType = 'all' | Customer['fiscalCondition']

// --- Mapeo de colores para el Avatar y los Chips ---
const CUSTOMER_STYLES: Record<
  Customer['fiscalCondition'],
  { color: 'primary' | 'secondary' | 'success' | 'warning'; label: string }
> = {
  RESPONSIBLE: { color: 'primary', label: 'Responsable Inscripto' },
  MONOTAX: { color: 'secondary', label: 'Monotributista' },
  FINAL_CONSUMER: { color: 'success', label: 'Consumidor Final' },
  EXEMPT: { color: 'warning', label: 'Exento' },
}

// --- Componente Principal de la Lista (Ajustado) ---
export default function CustomerList({ customers }: CustomerListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  // --- Estado "Activo" (el que filtra la lista) ---
  const [activeSortBy, setActiveSortBy] = useState<SortByType>('date-desc')
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<StatusFilterType>('all')
  const [activeFiscalConditionFilter, setActiveFiscalConditionFilter] =
    useState<FiscalConditionFilterType>('all')

  // --- Estado "Seleccionado" (temporal, para el drawer) ---
  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<StatusFilterType>(activeStatusFilter)
  const [selectedFiscalConditionFilter, setSelectedFiscalConditionFilter] =
    useState<FiscalConditionFilterType>(activeFiscalConditionFilter)

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...customers]

    if (searchTerm) {
      const lowercasedFilter = removeAccents(searchTerm).toLowerCase()
      filtered = filtered.filter(customer => {
        const userName = removeAccents(customer.name).toLowerCase()
        const lastName = removeAccents(customer.lastName).toLowerCase()

        // 1. Creamos el nombre completo
        const fullName = `${userName} ${lastName}`

        return (
          userName.includes(lowercasedFilter) ||
          lastName.includes(lowercasedFilter) ||
          fullName.includes(lowercasedFilter) // Busca "juan perez" en "juan perez"
        )
      })
    }

    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(
        customer =>
          (activeStatusFilter === 'active' && customer.active) ||
          (activeStatusFilter === 'inactive' && !customer.active),
      )
    }

    if (activeFiscalConditionFilter !== 'all') {
      filtered = filtered.filter(
        customer => customer.fiscalCondition === activeFiscalConditionFilter,
      )
    }

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
      case 'name-asc':
        filtered.sort((a, b) => a.lastName.localeCompare(b.lastName))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.lastName.localeCompare(a.lastName))
        break
      default:
        break
    }

    return filtered
  }, [
    customers,
    searchTerm,
    activeSortBy,
    activeStatusFilter,
    activeFiscalConditionFilter,
  ])

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedStatusFilter(activeStatusFilter)
    setSelectedFiscalConditionFilter(activeFiscalConditionFilter)
    onOpen()
  }

  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveStatusFilter(selectedStatusFilter)
    setActiveFiscalConditionFilter(selectedFiscalConditionFilter)
    onOpenChange()
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatusFilter(value as StatusFilterType)
  }

  const handleFiscalConditionFilterChange = (value: string) => {
    setSelectedFiscalConditionFilter(value as FiscalConditionFilterType)
  }

  // El grid ahora tiene h-full en sus hijos gracias a CustomerCard
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <Search
          placeholder='Buscar por nombre o apellido'
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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredAndSortedCustomers.length > 0 ? (
          filteredAndSortedCustomers.map(customer => {
            const { color: fiscalColor, label: fiscalLabel } =
              CUSTOMER_STYLES[customer.fiscalCondition]
            const isInactive = !customer.active

            return (
              <Card
                key={customer.id}
                as={isInactive ? 'div' : Link}
                isPressable={!isInactive}
                className={`h-full border-1 transition-opacity bg-white/70 backdrop-blur-sm border-white/20 w-full ${
                  isInactive ? 'opacity-60 hover:opacity-70' : ''
                }`}
                {...(!isInactive && {
                  href: paths.customerEdit(customer.id.toString()),
                })}
              >
                <CardBody className='flex h-full flex-col gap-3 p-4'>
                  {/* === SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL === */}
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <Avatar
                        name={`${customer.name} ${customer.lastName}`}
                        size='md'
                        color={fiscalColor}
                        className='flex-shrink-0'
                      />
                      <div className='flex flex-col'>
                        <h3 className='font-bold text-foreground capitalize'>
                          {`${customer.name} ${customer.lastName}`}
                        </h3>
                        <p className='text-xs text-foreground-500'>
                          {fiscalLabel}
                        </p>
                      </div>
                    </div>
                    {isInactive && (
                      <Chip size='sm' color='danger' variant='flat'>
                        Inactivo
                      </Chip>
                    )}
                  </div>

                  <Divider className='my-1' />

                  {/* === SECCIÓN 2: INFORMACIÓN DE CONTACTO === */}
                  <div className='flex flex-col gap-2'>
                    {customer.phone && (
                      <div className='flex items-center gap-2 text-sm text-foreground-600'>
                        <Phone size={16} className='text-default-400' />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className='flex items-center gap-2 text-sm text-foreground-600'>
                        <Mail size={16} className='text-default-400' />
                        <span className='truncate'>
                          {customer.email.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )
          })
        ) : (
          <EmptyListMsg text='No hay clientes disponibles.' />
        )}
      </div>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop='blur'
        placement='bottom'
        size='2xl'
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>
                  Filtros y Ordenamiento
                </h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div className='flex flex-col gap-6'>
                  <RadioGroup
                    label='Ordenar por'
                    value={selectedSortBy}
                    onValueChange={handleSortByChange}
                  >
                    <Radio value='date-desc'>Más recientes</Radio>
                    <Radio value='date-asc'>Más antiguos</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Filtrar por estado'
                    value={selectedStatusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    <Radio value='active'>Activos</Radio>
                    <Radio value='inactive'>Inactivos</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label='Filtrar por condición fiscal'
                    value={selectedFiscalConditionFilter}
                    onValueChange={handleFiscalConditionFilterChange}
                  >
                    <Radio value='all'>Todas</Radio>
                    {Object.entries(CUSTOMER_STYLES).map(([key, { label }]) => (
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
    </div>
  )
}

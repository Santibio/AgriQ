'use client'

import type { Customer } from '@prisma/client'
import { Avatar, CardBody, Chip, Card, Divider } from '@nextui-org/react'
import Link from 'next/link'
import paths from '@/lib/paths'
import { Mail, Phone } from 'lucide-react'
import EmptyListMsg from '@/components/empty-list'
import { useState } from 'react'
import { Search } from '@/components/search'

interface CustomerListProps {
  customers: Customer[]
}

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
  const [filteredList, setFilteredList] = useState(customers)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
    const lowercasedFilter = searchTermValue.toLowerCase()
    const filtered = customers.filter(customer => {
      const userName = customer.name.toLowerCase()
      const lastName = customer.lastName.toLowerCase()

      return (
        userName.includes(lowercasedFilter) ||
        lastName.includes(lowercasedFilter)
      )
    })
    setFilteredList(filtered)
  }

  // El grid ahora tiene h-full en sus hijos gracias a CustomerCard
  return (
    <div className='flex flex-col gap-2'>
      <Search
        placeholder='Buscar por nombre o apellido'
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        className='flex-1'
      />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredList.length > 0 ? (
          filteredList.map(customer => {
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
                        name={`${customer.lastName} ${customer.name}`}
                        size='md'
                        color={fiscalColor}
                        className='flex-shrink-0'
                      />
                      <div className='flex flex-col'>
                        <h3 className='font-bold text-foreground capitalize'>
                          {`${customer.lastName}, ${customer.name}`}
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
    </div>
  )
}

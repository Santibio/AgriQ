'use client'

import type { User } from '@prisma/client'
import {
  Avatar,
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
import UserMenu from './user-menu'
import Link from 'next/link'
import paths from '@/lib/paths'
import clsx from 'clsx'
import config from '@/config'
import CardWithShadow from '@/components/card-with-shadow'
import type { Color } from '@/lib/schemas/general' // O el tipo de color de tu librería
import { useMemo, useState } from 'react'
import { Search } from '@/components/search'
import EmptyListMsg from '@/components/empty-list'
import { ListFilter } from 'lucide-react'

// --- Mapeo de estilos para los roles de usuario ---
interface RoleStyle {
  color: Color
  variant: 'light' | 'flat' | 'solid'
}

const ROLE_STYLES: Record<string, RoleStyle> = {
  ADMIN: { color: 'danger', variant: 'flat' },
  SELLER: { color: 'primary', variant: 'flat' },
  DEPOSIT: { color: 'secondary', variant: 'flat' },
  default: { color: 'default', variant: 'flat' },
}

interface UserListProps {
  users: User[]
}

type SortByType = 'name-asc' | 'name-desc'
type StatusFilterType = 'all' | 'active' | 'inactive'
type RoleFilterType = 'all' | User['role']

export default function UserList({ users }: UserListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  const [activeSortBy, setActiveSortBy] = useState<SortByType>('name-asc')
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<StatusFilterType>('all')
  const [activeRoleFilter, setActiveRoleFilter] = useState<RoleFilterType>('all')

  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(activeSortBy)
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<StatusFilterType>(activeStatusFilter)
  const [selectedRoleFilter, setSelectedRoleFilter] =
    useState<RoleFilterType>(activeRoleFilter)

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users]

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase()
      filtered = filtered.filter(user => {
        const fullName = `${user.name} ${user.lastName}`.toLowerCase()
        return fullName.includes(lowercasedFilter)
      })
    }

    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(
        user =>
          (activeStatusFilter === 'active' && user.active) ||
          (activeStatusFilter === 'inactive' && !user.active),
      )
    }

    if (activeRoleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === activeRoleFilter)
    }

    switch (activeSortBy) {
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
  }, [users, searchTerm, activeSortBy, activeStatusFilter, activeRoleFilter])

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
  }

  const handleOpenDrawer = () => {
    setSelectedSortBy(activeSortBy)
    setSelectedStatusFilter(activeStatusFilter)
    setSelectedRoleFilter(activeRoleFilter)
    onOpen()
  }

  const handleApplyFilters = () => {
    setActiveSortBy(selectedSortBy)
    setActiveStatusFilter(selectedStatusFilter)
    setActiveRoleFilter(selectedRoleFilter)
    onOpenChange()
  }

  const handleSortByChange = (value: string) => {
    setSelectedSortBy(value as SortByType)
  }

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatusFilter(value as StatusFilterType)
  }

  const handleRoleFilterChange = (value: string) => {
    setSelectedRoleFilter(value as RoleFilterType)
  }

  if (!users.length) {
    return <EmptyListMsg text='No hay usuarios para mostrar.' />
  }

  return (
    <>
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
        <ul className='flex flex-col gap-3'>
          {filteredAndSortedUsers.length > 0 ? (
            filteredAndSortedUsers.map(user => {
            const roleConfig = config.roles.find(r => r.id === user.role)
            const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.default

            return (
              <li key={user.id}>
                <CardWithShadow
                  className={clsx(
                    'transition-opacity',
                    !user.active && 'opacity-60',
                  )}
                >
                  {/* Usamos un div relativo para posicionar el enlace superpuesto */}
                  <div className='relative flex items-center justify-between p-3'>
                    {/* Enlace superpuesto para usuarios activos */}
                    {user.active && (
                      <Link
                        href={paths.userEdit(user.id.toString())}
                        className='absolute inset-0 z-10'
                        aria-label={`Editar usuario ${user.name}`}
                      />
                    )}

                    {/* Contenido visible (Avatar, Nombre y Rol) */}
                    <div className='flex items-center gap-4'>
                      <Avatar
                        src={user.avatar}
                        showFallback
                        className='flex-shrink-0'
                      />
                      <div className='flex flex-col'>
                        <h3 className='font-bold capitalize text-slate-800'>
                          {`${user.lastName}, ${user.name}`}
                        </h3>
                        {roleConfig && (
                          <Chip
                            size='sm'
                            color={roleStyle.color}
                            variant={roleStyle.variant}
                            className='mt-1 w-fit' // w-fit para que el chip no ocupe todo el ancho
                          >
                            {roleConfig.label}
                          </Chip>
                        )}
                      </div>
                    </div>

                    {/* Acciones y Estado (con z-index mayor para ser clickeable) */}
                    <div className='relative z-20 flex items-center gap-3'>
                      {!user.active && (
                        <Chip size='sm' color='danger' variant='light'>
                          Inactivo
                        </Chip>
                      )}
                      <UserMenu userId={user.id} isActive={user.active} />
                    </div>
                  </div>
                </CardWithShadow>
              </li>
            )
          })
        ) : (
          <EmptyListMsg text='No se encontraron usuarios con esos filtros.' />
        )}
      </ul>
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
                <h2 className='text-xl font-semibold'>Filtros y Ordenamiento</h2>
              </DrawerHeader>
              <DrawerBody className='pb-10 pt-2'>
                <div className='flex flex-col gap-6'>
                  <RadioGroup
                    label='Ordenar por'
                    value={selectedSortBy}
                    onValueChange={handleSortByChange}
                  >
                    <Radio value='name-asc'>Apellido (A-Z)</Radio>
                    <Radio value='name-desc'>Apellido (Z-A)</Radio>
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
                    label='Filtrar por rol'
                    value={selectedRoleFilter}
                    onValueChange={handleRoleFilterChange}
                  >
                    <Radio value='all'>Todos</Radio>
                    {Object.keys(ROLE_STYLES)
                      .filter(key => key !== 'default')
                      .map(role => (
                        <Radio key={role} value={role}>
                          {config.roles.find(r => r.id === role)?.label}
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

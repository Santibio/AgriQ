'use client'

import type { User } from '@prisma/client'
import { Avatar, Chip } from '@heroui/react'
import UserMenu from './user-menu'
import Link from 'next/link'
import paths from '@/lib/paths'
import clsx from 'clsx'
import config from '@/config'
import CardWithShadow from '@/components/card-with-shadow'
import type { Color } from '@/lib/schemas/general' // O el tipo de color de tu librería
import { useState } from 'react'
import { Search } from '@/components/search'
import EmptyListMsg from '@/components/empty-list'

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

export default function UserList({ users }: UserListProps) {
  const [filteredList, setFilteredList] = useState(users)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
    const lowercasedFilter = searchTermValue.toLowerCase()
    const filtered = users.filter(user => {
      const userName = user.name.toLowerCase()
      const lastName = user.lastName.toLowerCase()

      return (
        userName.includes(lowercasedFilter) ||
        lastName.includes(lowercasedFilter)
      )
    })
    setFilteredList(filtered)
  }

  return (
    <div className='flex flex-col gap-2'>
      <Search
        placeholder='Buscar por nombre o apellido'
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        className='flex-1'
      />
      <ul className='flex flex-col gap-3'>
        {filteredList.length > 0 ? (
          filteredList.map(user => {
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
          <EmptyListMsg text='No hay usuarios disponibles.' />
        )}
      </ul>
    </div>
  )
}

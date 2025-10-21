import React from 'react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react'
import { LogOut, Settings } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { User } from '@prisma/client'
import CustomAvatar from '@/components/custom-avatar'
import Link from 'next/link'
import paths from '@/lib/paths'

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const logoutHandler = async () => {
    await logout()
  }

  return (
    <Dropdown placement='bottom-end'>
      <DropdownTrigger>
        <Button
          variant='light'
          className='rounded-full p-0 border-none transition-transform w-[45px] h-[45px]'
          isIconOnly
        >
          <CustomAvatar src={user.avatar} alt={user.username} size={45} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='Profile Actions' variant='flat'>
        <DropdownItem key='profile' className='h-14 gap-2'>
          <p className='font-semibold'>Ingreso con</p>
          <p className='font-semibold text-primary'>{user.username}</p>
        </DropdownItem>
        <DropdownItem
          key='setting'
          color='primary'
          as={Link}
          href={paths.settings()}
          startContent={<Settings className='size-4' />}
        >
          Ajustes
        </DropdownItem>
        <DropdownItem
          key='logout'
          color='danger'
          onClick={logoutHandler}
          startContent={<LogOut className='size-4' />}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

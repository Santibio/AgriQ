'use client'
import config from '@/config'
import { Button, Tab, Tabs } from '@heroui/react'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import paths from '@/lib/paths'
import { Home } from 'lucide-react'

const NavBar = () => {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className='fixed bottom-2 right-2'>
      <Button
        variant='shadow'
        isIconOnly
        as={Link}
        href={paths.home()}
        color='primary'
        radius='full'
        size='lg'
      >
        <Home className='h-5 w-5' />
      </Button>
    </nav>
  )
}

export default NavBar

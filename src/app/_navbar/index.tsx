'use client'
import { Button } from '@heroui/react'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import paths from '@/lib/paths'
import { Home } from 'lucide-react'

const NavBar = () => {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    // 1. Contenedor Fixed: Se pega abajo y ocupa todo el ancho.
    // 'pointer-events-none' permite hacer clic a través de los espacios vacíos.
    // 'z-50' asegura que flote sobre todo.
    <div className='fixed bottom-4 left-0 z-50 w-full pointer-events-none'>
      
      {/* 2. Contenedor Estructural: Centra el contenido y limita el ancho */}
      {/* 'px-4' añade un margen de seguridad en pantallas pequeñas */}
      <div className='mx-auto flex w-full max-w-[600px] justify-end px-4'>
        
        {/* 3. Nav: Reactivamos los clicks ('pointer-events-auto') solo para el botón */}
        <nav className='pointer-events-auto'>
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
      </div>
    </div>
  )
}

export default NavBar
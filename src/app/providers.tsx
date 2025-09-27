'use client'

import { HeroUIProvider } from '@heroui/react'
import { Toaster } from 'sonner'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useRouter } from 'next/navigation'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  const router = useRouter()

  return (
    <HeroUIProvider locale='es-ES' navigate={router.push}>
      <NextThemesProvider attribute='class' defaultTheme='light'>
        <Toaster position='top-center' richColors />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  )
}

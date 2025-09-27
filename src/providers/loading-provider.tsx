'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Spinner } from '@nextui-org/react'

type LoadingContextType = {
  isLoading: boolean
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = () => setIsLoading(true)
  const hideLoading = () => setIsLoading(false)

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {isLoading && (
        <div className='flex w-screen fixed inset-0 z-50 overflow-x-auto justify-center h-[--visual-viewport-height] items-center sm:items-center [--scale-enter:100%] [--scale-exit:100%] [--slide-enter:0px] [--slide-exit:80px] sm:[--scale-enter:100%] sm:[--scale-exit:103%] sm:[--slide-enter:0px] sm:[--slide-exit:0px] bg-black/90 backdrop-blur-sm'>
          <Spinner
            size='lg'
            color='primary'
            label='Cargando...'
            labelColor='primary'
            classNames={{
              wrapper: 'w-12 h-12 z-60',
              label: 'mt-2 text-primary font-medium',
            }}
          />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading debe usarse dentro de un LoadingProvider')
  }
  return context
}

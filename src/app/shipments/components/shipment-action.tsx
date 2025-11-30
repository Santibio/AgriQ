'use client'

import AddButton from '@/components/buttons/add-button'
import { Location } from '@prisma/client'
import { useRouter } from 'next/navigation'
import {
  useDisclosure,
  Button,
  DrawerContent,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Input,
} from '@heroui/react'
import { useState } from 'react'
import { ArrowLeftRight, ArrowRight, Truck } from 'lucide-react'
import paths from '@/lib/paths'

const LOCATION_MAP = {
  DEPOSIT: 'Depósito',
  MARKET: 'Mercado',
}

export default function ShipmentAction({ userRole }: { userRole: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const router = useRouter()
  const [location, setLocation] = useState<{
    origin: Location
    destination: Location
  }>(
    userRole === 'ADMIN' || userRole === 'DEPOSIT'
      ? {
          origin: Location.DEPOSIT,
          destination: Location.MARKET,
        }
      : {
          origin: Location.MARKET,
          destination: Location.DEPOSIT,
        },
  )

  const handleLocationChange = () => {
    setLocation(prev => ({
      origin: prev.destination,
      destination: prev.origin,
    }))
  }

  const handleCreateShipment = () => {
    router.push(paths.shipmentAdd(location.origin, location.destination))
    onOpenChange()
  }

  return (
    <>
      <AddButton onPress={onOpen}>Crear envío</AddButton>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement='bottom'
        backdrop='blur'
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className='flex flex-col gap-1'>
                <h3 className='font-semibold text-gray-900 flex items-center'>
                  <Truck className='h-6 w-6 mr-2' />
                  Nuevo Envío
                </h3>
              </DrawerHeader>
              <DrawerBody>
                <div className='flex gap-4 items-center py-4'>
                  <Input
                    label='Origen'
                    value={LOCATION_MAP[location.origin]}
                    color='primary'
                    disabled
                    labelPlacement='outside'
                  />
                  {userRole === 'ADMIN' ? (
                    <Button
                      isIconOnly
                      onPress={handleLocationChange}
                      variant='light'
                      className='items-end'
                    >
                      <ArrowLeftRight className='h-6 w-6 text-slate-500' />
                    </Button>
                  ) : (
                    <Button
                      isIconOnly
                      variant='light'
                      className='items-end'
                      disabled
                    >
                      <ArrowRight className='h-6 w-6 text-slate-500' />
                    </Button>
                  )}
                  <Input
                    label='Destino'
                    labelPlacement='outside'
                    value={LOCATION_MAP[location.destination]}
                    color='secondary'
                    disabled
                  />
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  color='primary'
                  onPress={handleCreateShipment}
                  fullWidth
                >
                  Continuar
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

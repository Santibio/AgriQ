'use client'

import { capitalize } from '@/lib/utils'
import {
  Button,
  DrawerContent,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Chip,
} from '@heroui/react'
import { Batch, Product } from '@prisma/client'
import { Eye } from 'lucide-react'

interface ShipmentDiscrepancyProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  batchs: (Batch & {
    product: Product
    depositQuantity?: number
    sentQuantity?: number
    marketQuantity?: number
  })[]
  quantities: { [batchId: number]: number }
  handleSave: () => Promise<string | number | undefined>
}

export default function ShipmentDiscrepancy({
  isOpen,
  onOpenChange,
  batchs,
  quantities,
  handleSave,
}: ShipmentDiscrepancyProps) {
  const batchWithQuantity = batchs.map(batch => ({
    ...batch,
    quantity: quantities[batch.id] || 0,
  }))

  const onCancel = () => {
    onOpenChange(false)
  }
  const onConfirm = async () => {
    onOpenChange(false)
    await handleSave()
  }
  return (
    <>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement='bottom'
        backdrop='blur'
        size='full'
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader>
                <h3 className='font-semibold text-gray-900 flex items-center'>
                  <Eye className='h-6 w-6 mr-2' />
                  Revisar envío a depósito
                </h3>
              </DrawerHeader>
              <DrawerBody>
                <ul className='pt-5'>
                  {batchWithQuantity.map(batch => {
                    const quantityToSent = quantities[batch.id] || 0
                    const marketQuantity = batch.marketQuantity || 0
                    const discrepancy = quantityToSent - marketQuantity
                    return (
                      <li className='mb-4 border p-2 rounded-md' key={batch.id}>
                        <div className='flex flex-col gap-1'>
                          <div className='flex gap-2 flex-col'>
                            <span className='font-semibold'>
                              Lote #{batch.id}
                            </span>
                            <Chip size='sm' radius='sm'>
                              {capitalize(batch.product.name)}
                            </Chip>
                          </div>
                          <div className='flex gap-4 mt-1 text-sm'>
                            <span className='text-gray-600'>
                              A enviar:{' '}
                              <span className='font-bold text-primary'>
                                {quantityToSent}
                              </span>
                            </span>
                            <span className='text-gray-600'>
                              Stock (sist.):{' '}
                              <span className='font-bold text-success'>
                                {marketQuantity}
                              </span>
                            </span>
                            <span
                              className={`text-gray-600 ${
                                discrepancy !== 0
                                  ? 'text-red-500 font-bold'
                                  : ''
                              }`}
                            >
                              Discrepancia: <span>{discrepancy}</span>
                            </span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </DrawerBody>
              <DrawerFooter>
                <Button variant='light' onPress={onCancel}>
                  Cancelar
                </Button>
                <Button variant='solid' onPress={onConfirm} color='primary'>
                  Confirmar
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

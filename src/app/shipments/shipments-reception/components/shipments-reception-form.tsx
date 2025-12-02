'use client'

import { Batch, Product } from '@prisma/client'
import { useState } from 'react'
import {
  Checkbox,
  Input,
  Button,
  Image,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Chip,
} from '@heroui/react'
import { createShipmentReception } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import paths from '@/lib/paths'
import { capitalize } from '@/lib/utils'
import FormWrapper from '@/components/layout/form-wrapper'
import CardWithShadow from '@/components/card-with-shadow'

type ShipmentFormProps = {
  batchs: (Batch & { product: Product; sentQuantity?: number })[]
  shipmentId: number // Agregado para manejar el modo de edición
}

const checkDiscrepancy = (
  batch: Batch & {
    product: Product
    sentQuantity?: number
  },
  receivedQuantity: number,
) => {
  return (batch.sentQuantity || 0) !== receivedQuantity
}

const getDiscrepancyQuantity = (
  batch: Batch & {
    product: Product
    sentQuantity?: number
  },
  receivedQuantity: number,
) => {
  return (batch.sentQuantity || 0) - receivedQuantity
}

export default function ShipmentForm({
  batchs,
  shipmentId,
}: ShipmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsloading] = useState<boolean>(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [selected, setSelected] = useState<{ [batchId: number]: boolean }>(() =>
    Object.fromEntries(batchs.map(b => [b.id, true])),
  )
  const [quantities, setQuantities] = useState<{ [batchId: number]: number }>(
    () => Object.fromEntries(batchs.map(b => [b.id, b.sentQuantity])),
  )

  const handleSelect = (batchId: number) => {
    setSelected(prev => ({ ...prev, [batchId]: !prev[batchId] }))
    setQuantities(prev => ({
      ...prev,
      [batchId]: batchs.find(b => b.id === batchId)?.sentQuantity || 0,
    }))
  }

  const handleQuantityChange = (batchId: number, value: string) => {
    const num = Number(value)
    setQuantities(prev => ({ ...prev, [batchId]: num }))
  }

  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onOpen()
  }

  const handleSubmit = async () => {
    setIsloading(true)
    const hasDiscrepancy = batchs.some(batch =>
      checkDiscrepancy(batch, quantities[batch.id] || 0),
    )

    const formData = batchs.map(b => ({
      batchId: b.id,
      quantity: quantities[b.id] || 0,
      discrepancyQuantity: getDiscrepancyQuantity(b, quantities[b.id] || 0),
    }))

    try {
      const response = await createShipmentReception(
        shipmentId,
        hasDiscrepancy,
        formData,
      )
      if (response?.errors) {
        return toast.error('Ocurrió un error al procesar la solicitud.')
      }
      toast.success('Recepción registrada correctamente')
      router.push(`/${paths.shipmentReception()}`)
    } catch (error) {
      console.error('Error al registrar la recepción:', error)
      toast.error('Ocurrió un error al procesar la solicitud.')
    } finally {
      setIsloading(false)
    }
  }

  return (
    <>
      <FormWrapper
        onSubmit={handleConfirm}
        buttonLabel='Registrar recepción de envío'
      >
        {batchs.map(batch => (
          <CardWithShadow key={batch.id} className='p-4 flex flex-col gap-3'>
            <div className='flex gap-4'>
              <Image
                src={batch.product.image}
                alt={batch.product.name}
                width={50}
                height={50}
                className='object-cover rounded-md'
              />
              <div className='flex flex-col gap-2 flex-1'>
                <span className='font-semibold text-lg text-gray-800 leading-none'>
                  {capitalize(batch.product.name)}
                </span>
                <div className='flex'>
                  <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                    Lote #{batch.id}
                  </span>
                </div>
              </div>
              <Checkbox
                isSelected={!!selected[batch.id]}
                onChange={() => handleSelect(batch.id)}
                aria-label={`Confirmar lote ${batch.id}`}
                color='success'
              />
            </div>
            <div className='flex items-center gap-10 mt-2'>
              <div className='flex flex-col'>
                <span className='text-sm text-gray-600 text-nowrap font-semibold mt-[-10px]'>
                  Cantidad enviada:
                </span>
                <div className='flex items-end gap-1'>
                  <span className='font-bold text-primary text-xl leading-none'>
                    {batch.sentQuantity}
                  </span>
                  <span className='text-sm leading-none'>Unidades</span>
                </div>
              </div>
              <Input
                type='number'
                min={0}
                value={
                  quantities[batch.id] !== undefined
                    ? String(quantities[batch.id])
                    : ''
                }
                onChange={e => handleQuantityChange(batch.id, e.target.value)}
                label='Recibido'
                placeholder='0'
                size='sm'
                isDisabled={selected[batch.id]}
              />
            </div>
          </CardWithShadow>
        ))}
      </FormWrapper>
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement='center'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Resumen de recepción
              </ModalHeader>
              <Divider />
              <ModalBody className='max-h-[calc(100vh-40rem)] overflow-y-auto'>
                <ul className='pt-5'>
                  {batchs.map(batch => {
                    const enviada = batch.sentQuantity
                    const recibida = quantities[batch.id] || 0
                    const discrepancia = enviada - recibida
                    return (
                      <li className='mb-4 border p-2 rounded-md' key={batch.id}>
                        <div className='flex flex-col gap-1'>
                          <div className='flex gap-2 items-center'>
                            <span className='font-semibold'>
                              Lote #{batch.id}
                            </span>
                            <Chip size='sm' radius='sm'>
                              {capitalize(batch.product.name)}
                            </Chip>
                          </div>
                          <div className='flex gap-4 mt-1 text-sm'>
                            <span className='text-gray-600'>
                              Enviada:{' '}
                              <span className='font-bold text-primary'>
                                {enviada}
                              </span>
                            </span>
                            <span className='text-gray-600'>
                              Recibida:{' '}
                              <span className='font-bold text-success'>
                                {recibida}
                              </span>
                            </span>
                            <span
                              className={`text-gray-600 ${
                                discrepancia !== 0
                                  ? 'text-red-500 font-bold'
                                  : ''
                              }`}
                            >
                              Discrepancia: <span>{discrepancia}</span>
                            </span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color='primary'
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

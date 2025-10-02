'use client'

import { Batch, Product } from '@prisma/client'
import { useState } from 'react'
import {
  Checkbox,
  Input,
  Card,
  Button,
  Image,
  ScrollShadow,
  useDisclosure,
} from '@heroui/react'
import { createShipment, editShipment } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import paths from '@/lib/paths'
import { capitalize } from '@/lib/utils'
import EmptyListMsg from '@/components/empty-list'
import ShipmentDiscrepancy from './shipment-discrepancy'

type ShipmentFormProps = {
  batchs: (Batch & { product: Product; filtered?: boolean })[]
  movementId?: number // Agregado para manejar el modo de edición
  canEdit?: boolean // Indica si se puede editar el envío
  isOriginDeposit?: boolean
}

const quantityToCheck = (
  batch: Batch & {
    product: Product
    depositQuantity?: number
    sentQuantity?: number
    marketQuantity?: number
  },
  isEditing: boolean,
  isOriginDeposit: boolean,
) => {
  if (isEditing) {
    return batch.sentQuantity
  }
  if (isOriginDeposit) {
    return batch.depositQuantity
  }
  return batch.marketQuantity
}

export default function ShipmentForm({
  batchs,
  movementId,
  canEdit = false,
  isOriginDeposit,
}: ShipmentFormProps) {
  /* Todo revisar los casos de ver con status no ok o ok */
  const hasMovementId = Boolean(movementId)
  const isEditing = canEdit

  const isViewing = !isEditing && hasMovementId

  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Estado para lotes seleccionados y cantidades
  const [selected, setSelected] = useState<{ [batchId: number]: boolean }>(() =>
    Object.fromEntries(batchs.map(b => [b.id, !b.filtered])),
  )

  const [quantities, setQuantities] = useState<{ [batchId: number]: number }>(
    () =>
      Object.fromEntries(
        batchs.map(b => [b.id, quantityToCheck(b, isEditing, isOriginDeposit ?? false)]),
      ),
  )

  const [initialQuantities] = useState<{ [batchId: number]: number }>(() =>
    Object.fromEntries(
      batchs.map(b => [b.id, quantityToCheck(b, isEditing, isOriginDeposit ?? false)]),
    ),
  )

  const handleSelect = (batchId: number) => {
    setSelected(prevSelected => {
      const newSelectedState = !prevSelected[batchId]

      if (newSelectedState) {
        // If the batch is being selected, restore its initial quantity.
        setQuantities(prevQuantities => ({
          ...prevQuantities,
          [batchId]: initialQuantities[batchId],
        }))
      } else {
        // If the batch is being deselected, reset its quantity to 0.
        setQuantities(prevQuantities => ({
          ...prevQuantities,
          [batchId]: 0,
        }))
      }

      return { ...prevSelected, [batchId]: newSelectedState }
    })
  }

  const handleQuantityChange = (batchId: number, value: string) => {
    const num = Number(value)
    setQuantities(prev => ({ ...prev, [batchId]: num }))
  }

  const handleSave = async () => {
    const selectedBatches = batchs.filter(b => selected[b.id])
    const formData = selectedBatches.map(b => ({
      batchId: b.id,
      quantity: quantities[b.id] || 0,
      discrepancyQuantity: isOriginDeposit
        ? 0
        : quantities[b.id] - b.marketQuantity,
    }))

    try {
      const response = isEditing
        ? await editShipment(Number(movementId), formData)
        : await createShipment(formData, isOriginDeposit ?? false)

      if (response?.errors) {
        return toast.error('Ocurrió un error al procesar la solicitud.')
      }

      toast.success('Envio generado correctamente')
      router.push(paths.shipments())
    } catch (error) {
      console.error('Error al enviar los lotes:', error)
      toast.error('Ocurrió un error al procesar la solicitud.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOriginDeposit) {
      return onOpen()
    }
    await handleSave()
  }

  const hasError =
    batchs.some(
      batch =>
        selected[batch.id] &&
        (quantities[batch.id] === undefined ||
          quantities[batch.id] < 1 ||
          quantities[batch.id] >
            (isEditing
              ? batch.sentQuantity + batch.depositQuantity
              : batch.depositQuantity)),
    ) || !batchs.some(batch => selected[batch.id])

  const depositQuantity = (
    batch: Batch & {
      product: Product
      depositQuantity?: number
      sentQuantity?: number
    },
  ) => {
    if (isEditing) {
      // Calculate remaining deposit after editing, never less than 0
      const remaining =
        (initialQuantities[batch.id] ?? 0) +
        (batch.depositQuantity ?? 0) -
        (quantities[batch.id] ?? 0)
      return Math.max(0, remaining)
    }
    // For creation, never less than 0
    const remaining = (batch.depositQuantity ?? 0) - (quantities[batch.id] ?? 0)
    return Math.max(0, remaining)
  }

  if (batchs.length === 0) {
    return <EmptyListMsg text='No hay lotes disponibles para enviar.' />
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col justify-between h-[calc(100vh-210px)]'
      >
        <ScrollShadow className='pb-1 flex-1 w-full' size={100}>
          <div className='flex flex-col gap-6'>
            {batchs.map(batch => (
              <Card
                key={batch.id}
                className='p-6 flex flex-col gap-3 border border-gray-200 shadow-sm transition-all '
              >
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
                  {isOriginDeposit && (
                    <Checkbox
                      isSelected={!!selected[batch.id]}
                      onChange={() => handleSelect(batch.id)}
                      aria-label={`Seleccionar lote ${batch.id}`}
                    />
                  )}
                </div>
                <div className='flex items-center gap-10 mt-2'>
                  {isOriginDeposit && (
                    <div className='flex flex-col'>
                      <span className='text-sm text-gray-600 text-nowrap font-semibold mt-[-10px]'>
                        En depósito quedará:
                      </span>
                      <div className='flex items-end gap-1'>
                        <span className='font-bold text-primary text-xl leading-none'>
                          {depositQuantity(batch)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Input
                    type='number'
                    min={0}
                    max={
                      isOriginDeposit
                        ? isEditing
                          ? batch.sentQuantity + batch.depositQuantity
                          : batch.depositQuantity
                        : batch.initialQuantity
                    }
                    value={
                      quantities[batch.id] !== undefined
                        ? String(quantities[batch.id])
                        : ''
                    }
                    onChange={e =>
                      handleQuantityChange(batch.id, e.target.value)
                    }
                    label='Enviar'
                    placeholder='0'
                    size='sm'
                    isDisabled={!selected[batch.id]}
                  />
                </div>
              </Card>
            ))}
          </div>
        </ScrollShadow>
        {!isViewing && (
          <Button
            variant='ghost'
            type='submit'
            className='mt-auto w-full'
            color='primary'
            isDisabled={isOriginDeposit ? hasError : false}
          >
            {isEditing ? 'Editar Envío' : 'Crear Envío'}
          </Button>
        )}
      </form>
      <ShipmentDiscrepancy
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        batchs={batchs}
        quantities={quantities}
        handleSave={handleSave}
      />
    </>
  )
}

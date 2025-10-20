'use client'

import { useState } from 'react'
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
} from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { cx } from '@/lib/utils'
import { CancelReason } from '@prisma/client'

// 1. Define el tipo para los motivos de cancelación, basado en tu enum de Prisma
export type CancellationReason =
  | 'CUSTOMER_REQUEST'
  | 'OUT_OF_STOCK'
  | 'ORDER_LOADED_ERROR'
  | 'PAYMENT_EXPIRED'
  | 'OTHERS'

// 2. Define las props que recibirá el componente
interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: CancelReason) => Promise<void>
  orderId: number | string // Para mostrar en el título
}

// 3. Mapeo de los motivos a etiquetas legibles y descripciones
const reasonDetails = {
  CUSTOMER_REQUEST: {
    label: 'Solicitud del Cliente',
    description: 'El cliente contactó y pidió cancelar su pedido.',
  },
  OUT_OF_STOCK: {
    label: 'Falta de Stock',
    description: 'No hay unidades disponibles para completar el pedido.',
  },
  ORDER_LOADED_ERROR: {
    label: 'Error en la Carga',
    description: 'El pedido se cargó con productos o precios incorrectos.',
  },
  PAYMENT_EXPIRED: {
    label: 'Cobro Vencido',
    description: 'El cliente no realizó el pago en el tiempo establecido.',
  },
  OTHERS: {
    label: 'Otro Motivo',
    description:
      'Motivo no especificado, utilizar si el motivo no se encuentra en la lista.',
  },
}

export default function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
}: CancellationModalProps) {
  const [selectedReason, setSelectedReason] =
    useState<CancelReason | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    if (!selectedReason) return
    setIsConfirming(true)
    try {
      await onConfirm(selectedReason)
    } finally {
      setIsConfirming(false)
    }
  }

  // Resetea el estado cuando el modal se cierra
  const handleClose = () => {
    if (isConfirming) return
    setSelectedReason(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} placement='center'>
      <ModalContent>
        <ModalHeader className='flex items-center gap-2'>
          <AlertTriangle className='text-red-500' />
          Confirmar Cancelación del Pedido #{orderId}
        </ModalHeader>
        <ModalBody>
          <p className='text-slate-500 mb-4 text-sm'>
            Por favor, selecciona el motivo por el cual se cancela este pedido.
            Esta acción es irreversible.
          </p>

          {/* Grupo de opciones para seleccionar el motivo */}
          <RadioGroup
            value={selectedReason || ''}
            onValueChange={value =>
              setSelectedReason(value as CancelReason)
            }
            className='w-full'
          >
            {Object.entries(reasonDetails).map(
              ([key, { label, description }]) => (
                <Radio
                  key={key}
                  value={key}
                  description={description}
                  classNames={{
                    base: cx(
                      'flex m-0 items-center justify-between w-full',
                      'flex-row-reverse cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent',
                      'data-[selected=true]:border-danger',
                    ),
                  }}
                >
                  {label}
                </Radio>
              ),
            )}
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color='danger'
            onPress={handleConfirm}
            isDisabled={!selectedReason || isConfirming}
            isLoading={isConfirming}
          >
            Confirmar Cancelación
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

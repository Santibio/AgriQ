'use client'

import { useForm, Controller } from 'react-hook-form'
import { Batch, Product } from '@prisma/client'
import { Alert, Autocomplete, AutocompleteItem, Input } from '@heroui/react'
import { capitalize } from '@/lib/helpers/text'

import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import {
  AddProductionInputs,
  CreateProductionFormSchema,
} from '@/lib/schemas/production'
import { createProduction, editProduction } from '../actions'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import paths from '@/lib/paths'
import FormWrapper from '@/components/layout/form-wrapper'

interface ProductionFormProps {
  products: Product[]
  batch?: Batch
  canEdit?: boolean
}

export default function ProductionForm({
  products,
  batch,
  canEdit = true,
}: ProductionFormProps) {
  const router = useRouter()

  const isEditing = Boolean(batch)

  type FormInputs = typeof isEditing extends boolean
    ? AddProductionInputs
    : AddProductionInputs

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(CreateProductionFormSchema),
    defaultValues: {
      product: String(batch?.productId) || '',
      quantity: batch?.initialQuantity || undefined,
    },
  })

  const [isLoading, setIsloading] = useState<boolean>(false)

  const onSubmit = async (data: AddProductionInputs) => {
    try {
      setIsloading(true)
      const response = isEditing
        ? await editProduction(Number(batch?.id), data)
        : await createProduction(data)
      if (response?.errors) {
        const errorMessage =
          response.errors._form?.[0] || 'An unexpected error occurred.'
        toast.error(errorMessage)
      } else {
        toast.success(isEditing ? 'Lote editado correctamente' : 'Lote creado correctamente')
        router.push(paths.production())
      }
    } catch (error) {
      console.log('Error: ', error)
      toast.error('An unexpected error occurred.')
    } finally {
      setIsloading(false)
    }
  }

  return (
    <FormWrapper
      onSubmit={handleSubmit(onSubmit)}
      buttonLabel='Confirmar'
      buttonProps={{ isLoading, isDisabled: isLoading }}
      showButton={canEdit}
      showScrollShadow={false}
    >
      <div className='flex flex-col gap-4 w-full'>
        <Controller
          name='product'
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              label='Producto'
              placeholder='Buscar producto'
              onSelectionChange={key => {
                field.onChange(key) // Actualiza el valor en el form
              }}
              defaultItems={products}
              isInvalid={!!errors.product}
              errorMessage={errors.product?.message}
              defaultSelectedKey={batch?.productId?.toString() || ''}
              isDisabled={!canEdit}
              startContent={
                <Search
                  className='text-default-400'
                  strokeWidth={2.5}
                  size={20}
                />
              }
            >
              {item => (
                <AutocompleteItem key={item.id}>
                  {capitalize(item.name)}
                </AutocompleteItem>
              )}
            </Autocomplete>
          )}
        />
        <Controller
          name='quantity'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type='number'
              label='Cantidad'
              placeholder='Ingresar cantidad'
              value={field.value?.toString() ?? ''}
              onChange={e => field.onChange(Number(e.target.value))}
              isInvalid={!!errors.quantity}
              errorMessage={errors.quantity?.message}
              isDisabled={!canEdit}
            />
          )}
        />
        {!canEdit && (
          <div className='flex justify-center mt-5'>
            <Alert
              color='secondary'
              title='Edición de Lote Bloqueada'
              description='Este lote no puede ser modificado porque ya tiene un historial de transacciones (ventas, envios, etc.).'
              variant='flat'
            />
          </div>
        )}
      </div>
    </FormWrapper>
  )
}

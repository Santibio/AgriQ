'use client'

import { Customer, PaymentMethod } from '@prisma/client'
import {
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Select,
  SelectItem,
  Button,
  NumberInput,
  Card,
  Divider,
  CardBody,
} from '@heroui/react'
import { capitalize } from '@/lib/helpers/text'
import { confirmOrder } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState, useRef, useCallback } from 'react'
import paths from '@/lib/paths'
import FormWrapper from '@/components/layout/form-wrapper'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import { Upload } from 'lucide-react'

interface ProductItem {
  productId: number
  productName: string
  quantity: number
  price: number
  subtotal: number
  [key: string]: string | number // Index signature for dynamic property access
}

interface Order {
  id: number
  customer: Customer
  products: ProductItem[]
  subtotal: number
}

interface ProductionFormProps {
  order: Order
}

const columns = [
  { key: 'productName', label: 'Producto' },
  { key: 'quantity', label: 'Cantidad' },
  { key: 'price', label: 'Precio Unit.' },
  { key: 'subtotal', label: 'Subtotal' },
]

const paymentMethodsMap = {
  CASH: 'Efectivo',
  WIRE: 'Transferencia',
}

export default function PaymentOrderForm({ order }: ProductionFormProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  )
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [discount, setDiscount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value)
    // Reset payment proof when changing payment method
    if (value !== PaymentMethod.WIRE) {
      setPaymentProof(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0])
    }
  }

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault()

    try {
      const response = await confirmOrder(
        order.id,
        paymentMethod,
        paymentProof,
        discount,
      )

      if (response?.errors) {
        return toast.error('Ocurrió un error al procesar la solicitud.')
      }

      toast.success('Cobro creado correctamente')
      router.push(paths.orders())
    } catch (error) {
      console.error('Error al crear el cobro:', error)
      toast.error('Ocurrió un error al procesar la solicitud.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderCell = useCallback(
    (product: ProductItem, columnKey: keyof ProductItem) => {
      const cellValue = product[columnKey]

      switch (columnKey) {
        case 'productName':
          return <span>{capitalize(String(cellValue))}</span>
        case 'price':
          return (
            <div className='flex justify-end'>
              <span>{convertToArgentinePeso(Number(cellValue))}</span>
            </div>
          )
        case 'subtotal':
          return (
            <div className='flex justify-end'>
              <span className='font-medium'>
                {convertToArgentinePeso(Number(cellValue))}
              </span>
            </div>
          )
        case 'quantity':
          return (
            <div className='flex justify-center'>
              <span>{cellValue}</span>
            </div>
          )
        default:
      }
    },
    [],
  )

  const total = order.subtotal - discount

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      buttonLabel='Confirmar'
      buttonProps={{ isLoading }}
    >
      <div className='flex flex-col gap-6 w-full h-full pb-10'>
        <Input
          readOnly
          label='Cliente'
          defaultValue={order?.customer.name + ' ' + order?.customer.lastName}
          labelPlacement='outside'
          variant='flat'
          radius='sm'
        />
        <div className='space-y-4'>
          <Select
            label='Forma de cobro'
            selectedKeys={[paymentMethod]}
            onSelectionChange={keys => {
              const selected = Array.from(keys)[0] as PaymentMethod
              handlePaymentMethodChange(selected)
            }}
            variant='flat'
            radius='sm'
            labelPlacement='outside'
          >
            {Object.values(PaymentMethod).map(method => (
              <SelectItem key={method}>{paymentMethodsMap[method]}</SelectItem>
            ))}
          </Select>

          {paymentMethod === PaymentMethod.WIRE && (
            <div className='flex flex-col gap-2'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
                accept='image/*'
                className='hidden'
              />
              <Button
                variant='flat'
                color={paymentProof ? 'success' : 'primary'}
                onPress={() => fileInputRef.current?.click()}
                className='w-full'
                startContent={<Upload className='w-5 h-5' />}
              >
                {paymentProof ? 'Comprobante cargado' : 'Subir comprobante'}
              </Button>
              {paymentProof && (
                <p className='text-xs text-gray-500 mt-1'>
                  Archivo: {paymentProof.name}
                </p>
              )}
            </div>
          )}
          <NumberInput
            label='Descuento'
            value={discount}
            onValueChange={setDiscount}
            radius='sm'
            variant='flat'
          />
        </div>
        <div>
          <span className='font-medium text-small'>Resumen</span>
          <Table
            isHeaderSticky
            aria-label='order products'
            shadow='none'
            className='w-[100vw] ml-[-15px] mt-[-6px] max-w-[600px]'
            radius='md'
            classNames={{
              base: 'max-h-[55dvh] overflow-scroll',
            }}
          >
            <TableHeader columns={columns} className='p-0'>
              {column => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={order.products} className='p-0'>
              {product => (
                <TableRow key={product.productId}>
                  {columnKey => (
                    <TableCell>{renderCell(product, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex-1 items-end justify-end flex'>
          <Card
            className='flex w-full flex-col p-4 bg-slate-50 gap-4'
            shadow='none'
          >
            <CardBody className='space-y-3 text-foreground'>
              <div className='flex justify-between items-center'>
                <span className='text-base'>Subtotal</span>
                <span className='text-base font-semibold'>
                  {convertToArgentinePeso(order.subtotal)}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-base'>Descuento</span>
                <span className='text-base font-semibold text-danger'>
                  -{convertToArgentinePeso(discount)}
                </span>
              </div>

              <Divider />

              <div className='flex justify-between items-center'>
                <span className='text-lg font-bold'>Total</span>
                <span className='text-lg font-bold text-success'>
                  {convertToArgentinePeso(total)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </FormWrapper>
  )
}

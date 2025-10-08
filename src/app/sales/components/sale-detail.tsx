import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Button,
  Card,
  CardBody,
  Chip,
  CardFooter,
  Divider,
} from '@heroui/react'
import { SaleWithRelations } from './sales-list'

import { formatLongDate } from '@/lib/helpers/date'
import { FiscalCondition } from '@prisma/client'
import { capitalize } from '@/lib/utils'
import { convertToArgentinePeso } from '@/lib/helpers/number'
import { Share2Icon } from 'lucide-react'

const PAYMENT_METHODS = {
  WIRE: 'Transferencia',
  CASH: 'Efectivo',
}

const FISCAL_CONDITIONS: Record<FiscalCondition, string> = {
  FINAL_CONSUMER: 'Consumidor Final',
  RESPONSIBLE: 'Responsable Inscripto',
  MONOTAX: 'Monotributista',
  EXEMPT: 'Exento',
}

interface SaleDetailProps {
  sale: SaleWithRelations | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function SaleDetail({
  sale,
  isOpen,
  onOpenChange,
}: SaleDetailProps) {
  if (!sale) return null

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop='blur'
      placement='bottom'
      size='full'
    >
      <DrawerContent>
        {() => (
          <div className='flex flex-col h-full bg-gray-50'>
            {/* Header */}
            <DrawerHeader className='border-b border-gray-200 px-4 py-3'>
              <div className='flex justify-between items-start gap-2'>
                <div>
                  <h2 className='text-lg font-bold text-gray-800'>
                    Venta #{sale.id}
                  </h2>
                  <p className='text-xs text-gray-500'>
                    {formatLongDate(sale.createdAt)}
                  </p>
                </div>
              </div>
            </DrawerHeader>

            {/* Body */}
            <DrawerBody className='space-y-5 p-4 overflow-y-auto'>
              <section className='flex flex-col gap-2'>
                <h3 className='text-lg font-semibold text-gray-900'>Cliente</h3>
                {/* Cliente */}
                <Card className='bg-white/70 backdrop-blur-sm border-white/20 h-full'>
                  <CardBody className='space-y-2'>
                    <div className='space-y-1'>
                      <p className='font-medium text-gray-800'>
                        {sale.order.customer.name}{' '}
                        {sale.order.customer.lastName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {sale.order.customer.phone}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {sale.order.customer.email}
                      </p>
                      <Chip
                        size='md'
                        variant='flat'
                        className='mt-1 text-xs tracking-wide'
                        color='primary'
                      >
                        {FISCAL_CONDITIONS[sale.order.customer.fiscalCondition]}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              </section>

              {/* Pago */}
              <section className='flex flex-col gap-2'>
                <h3 className='text-lg font-semibold text-gray-900'>Cobro</h3>
                <Card className='bg-white/70 backdrop-blur-sm border-white/20 h-full'>
                  <CardBody className='space-y-3'>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Método:</span>
                        <span className='font-medium text-gray-800'>
                          {PAYMENT_METHODS[sale.paymentMethod]}
                        </span>
                      </div>
                      {sale.paymentReceipt && (
                        <div className='pt-1'>
                          <p className='text-gray-600 mb-1'>Comprobante:</p>
                          <a
                            href={sale.paymentReceipt}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-600 font-medium flex items-center gap-1'
                          >
                            Ver comprobante
                          </a>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </section>

              {/* Productos */}
              <section className='flex flex-col gap-2'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Productos
                </h3>
                <Card className='bg-white/70 backdrop-blur-sm border-white/20 h-full'>
                  <CardBody className='space-y-3'>
                    <div className='divide-y divide-gray-100'>
                      {sale.order.details.map(item => (
                        <div
                          key={item.id}
                          className='flex justify-between items-start py-3'
                        >
                          <div>
                            <p className='font-medium text-gray-800'>
                              {capitalize(item.productName)}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {item.quantity} x{' '}
                              {convertToArgentinePeso(item.price)}
                            </p>
                          </div>
                          <p className='font-semibold text-gray-800'>
                            {convertToArgentinePeso(item.quantity * item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                  <CardFooter className='flex flex-col gap-2'>
                    <Divider />

                    <div className='space-y-3 text-foreground flex flex-col w-full'>
                      <div>
                        <div className='flex justify-between items-center'>
                          <span className='text-slate-500 text-sm'>
                            Subtotal
                          </span>
                          <span className='text-base font-semibold'>
                            {convertToArgentinePeso(sale.subtotal)}
                          </span>
                        </div>

                        <div className='flex justify-between items-center'>
                          <span className='text-slate-500 text-sm'>
                            Descuento
                          </span>
                          <span className='text-base font-semibold text-danger'>
                            -{convertToArgentinePeso(sale.discount)}
                          </span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-lg font-bold'>Total</span>
                        <span className='text-lg font-bold text-success'>
                          {convertToArgentinePeso(sale.total)}
                        </span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </section>
            </DrawerBody>

            {/* Footer */}
            <DrawerFooter className='border-t border-gray-200 p-4'>
              <Button
                fullWidth
                color='primary'
                onPress={() => window.print()}
                startContent={<Share2Icon className='h-4 w-4' />}
              >
                Compartir comprobante
              </Button>
            </DrawerFooter>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

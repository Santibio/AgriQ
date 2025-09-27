import { DollarSign, Edit, Trash } from 'lucide-react'

import {
  Button,
  Card,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Image,
} from '@heroui/react'
import { capitalize } from '@/lib/utils'
import { convertToArgentinePeso } from '@/lib/helpers/number'

interface OrderDetailProps {
  handleEditProduct?: (index: number) => void
  handleDeleteProduct?: (index: number) => void
  onOpenChange: () => void
  isOpen: boolean
  productsList: Array<{
    productId: number
    productName: string
    quantity: number
    price: number
    selectedQuantity: number
    image?: string
  }>
}
export default function OrderDetail({
  productsList,
  isOpen,
  onOpenChange,
  handleDeleteProduct,
  handleEditProduct,
}: OrderDetailProps) {
  if (!productsList || productsList.length === 0) {
    return (
      <div className='text-center text-gray-500 mt-10'>
        No hay productos agregados al pedido.
      </div>
    )
  }

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
          <>
            <DrawerHeader className='flex flex-col gap-1'>
              <h3 className='font-semibold text-gray-900 flex items-center'>
                <DollarSign className='h-4 w-4 mr-2' />
                Resumen del Pedido
              </h3>
            </DrawerHeader>
            <DrawerBody className='pb-10 pt-2'>
              <div className='mt-3'>
                <ul
                  aria-label='Productos agregados'
                  className='w-full space-y-2'
                >
                  {productsList.map((product, index) => (
                    <li key={`${product.productId}-${product.quantity}`}>
                      <Card
                        shadow='sm'
                        className='active:scale-[0.98] transition-transform'
                      >
                        <CardBody className='p-3'>
                          <div className='flex justify-between gap-3'>
                            {/* Imagen */}
                            <Image
                              src={product.image}
                              alt={product.productName}
                              width={50}
                              height={50}
                              className='object-cover rounded-md flex-shrink-0'
                            />

                            {/* Info */}
                            <div className='flex-1 min-w-0 flex flex-col justify-between'>
                              <h4 className='font-medium text-gray-900 text-md truncate'>
                                {capitalize(product.productName)}
                              </h4>
                              <div className='text-sm text-gray-600 flex gap-1'>
                                <span>{product.selectedQuantity}×</span>
                                <span>
                                  {convertToArgentinePeso(product.price)}
                                </span>
                                <span>=</span>
                                <span className='font-semibold text-green-600'>
                                  {convertToArgentinePeso(
                                    product.price * product.selectedQuantity,
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Botones táctiles */}
                            <div className='flex items-center gap-2'>
                              {handleEditProduct && (
                                <Button
                                  variant='light'
                                  isIconOnly
                                  onPress={() => handleEditProduct(index)}
                                  className='h-9 w-9 rounded-full bg-blue-50 text-blue-600 active:bg-blue-100'
                                >
                                  <Edit className='h-5 w-5' />
                                </Button>
                              )}
                              {handleDeleteProduct && (
                                <Button
                                  variant='light'
                                  isIconOnly
                                  onPress={() => handleDeleteProduct(index)}
                                  className='h-9 w-9 rounded-full bg-red-50 text-red-600 active:bg-red-100'
                                >
                                  <Trash className='h-5 w-5' />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            </DrawerBody>
            <DrawerFooter className='bg-slate-50 p-6'>
              <div className='items-center justify-between flex w-full'>
                <span>Cantidad de productos: {productsList.length}</span>
                <span className='text-lg font-semibold'>
                  Total:{' '}
                  {convertToArgentinePeso(
                    productsList.reduce(
                      (acc, p) => acc + p.price * p.selectedQuantity,
                      0,
                    ),
                  )}
                </span>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

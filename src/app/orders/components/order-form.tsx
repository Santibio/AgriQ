'use client'

import { Customer } from '@prisma/client'
import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  Input,
} from '@heroui/react'
import { capitalize } from '@/lib/helpers/text'

import { EyeIcon, Search } from 'lucide-react'

import { createOrder, editOrder } from '../actions'
import { Key, useState } from 'react'
import { Button, useDisclosure } from '@heroui/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import paths from '@/lib/paths'
import FormWrapper from '@/components/layout/form-wrapper'
import CustomerForm from './customer-form'
import OrderDetail from './order-detail'
import { convertToArgentinePeso } from '@/lib/helpers/number'

interface Product {
  productId: number
  productName: string
  quantity: number
  price: number
  image: string // Hacemos que image sea obligatorio
}

interface ProductionFormProps {
  products: Product[]
  customers: Customer[]
  movementId?: number
  orderId?: number
  initialData?: {
    customerId?: number
    products?: {
      productId: number
      productName: string
      quantity: number
      price: number
      image: string // Hacemos que image sea obligatorio
    }[]
  }
}

export default function OrderForm({
  products,
  customers,
  initialData,
  orderId,
  movementId,
}: ProductionFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData)

  const {
    isOpen: isOpenCustomerDrawer,
    onOpen: onOpenCustomerDrawer,
    onOpenChange: onOpenChangeCustomerDrawer,
  } = useDisclosure()
  const {
    isOpen: isOpenDetailOrderDrawer,
    onOpen: onOpenDetailOrderDrawer,
    onOpenChange: onOpenChangeDetailOrderDrawer,
  } = useDisclosure()

  const [isLoading, setIsLoading] = useState(false)
  const [orderFormData, setOrderFormData] = useState<{
    customerId: number
    products: {
      productId: number
      productName: string
      quantity: number
      price: number
      image?: string
    }[]
  }>({
    customerId: initialData?.customerId || 0,
    products: initialData?.products || [],
  })

  const [selectedProduct, setSelectedProduct] = useState<{
    productId: number
    productName: string
    quantity: number
    price: number
    image: string
  } | null>(null)

  const [productFormFata, setProductFormData] = useState({
    productId: '',
    quantity: 0,
  })

  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null,
  )

  const [productsList, setProductsList] = useState<
    Array<{
      productId: number
      productName: string
      quantity: number
      price: number
      selectedQuantity: number
      image: string
    }>
  >(
    initialData?.products
      ? initialData.products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          quantity: p.quantity,
          price: p.price,
          selectedQuantity: p.quantity,
          image: p.image,
        }))
      : [],
  )

  // Filtrar productos ya agregados, permitiendo el producto que se está editando
  const availableProducts = products.filter(b => {
    if (editingProductIndex !== null) {
      const editingProduct = productsList[editingProductIndex]
      if (b.productId === editingProduct.productId) {
        return true
      }
    }
    return !productsList.some(p => p.productId === b.productId)
  })

  const handleChangeProductForm = (value: Key | null) => {
    setProductFormData({ productId: String(value), quantity: 0 })
    const foundProduct = availableProducts.find(
      b => b.productId === Number(value),
    )
    setSelectedProduct(
      foundProduct
        ? {
            productId: foundProduct.productId,
            productName: foundProduct.productName,
            quantity: foundProduct.quantity,
            price: foundProduct.price,
            image: foundProduct.image,
          }
        : null,
    )
  }

  const handleAddProduct = () => {
    if (editingProductIndex !== null) {
      const updatedProductsList = [...productsList]
      const productToUpdate = updatedProductsList[editingProductIndex]

      if (
        !selectedProduct ||
        !productFormFata.quantity ||
        productFormFata.quantity <= 0
      ) {
        toast.error('Selecciona un producto y cantidad válida')
        return
      }

      updatedProductsList[editingProductIndex] = {
        ...productToUpdate,
        selectedQuantity: productFormFata.quantity,
        price: selectedProduct.price,
      }

      setProductsList(updatedProductsList)

      const updatedOrderProducts = updatedProductsList.map(p => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.selectedQuantity,
        price: p.price,
        image: p.image,
      }))

      setOrderFormData(prev => ({
        ...prev,
        products: updatedOrderProducts,
      }))

      setEditingProductIndex(null)
      setProductFormData({ productId: '', quantity: 0 })
      setSelectedProduct(null)
      toast.success('Producto actualizado correctamente')
      return
    }

    if (
      !selectedProduct ||
      !productFormFata.quantity ||
      productFormFata.quantity <= 0
    ) {
      toast.error('Selecciona un producto y cantidad válida')
      return
    }

    setProductsList(prev => [
      ...prev,
      {
        ...selectedProduct,
        selectedQuantity: productFormFata.quantity,
        image: selectedProduct.image, // Asegurar que la imagen se incluya
      },
    ])
    setProductFormData({ productId: '', quantity: 0 })
    setSelectedProduct(null)
    setOrderFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          productId: selectedProduct.productId,
          productName: selectedProduct.productName,
          quantity: productFormFata.quantity,
          price: selectedProduct.price,
          image: selectedProduct.image,
        },
      ],
    }))
  }

  const handleDeleteProduct = (index: number) => {
    const productToRemove = productsList[index]
    const newProductsList = productsList.filter((_, i) => i !== index)
    setProductsList(newProductsList)

    setOrderFormData(prev => ({
      ...prev,
      products: prev.products.filter(
        p => p.productId !== productToRemove.productId,
      ),
    }))

    toast.success('Producto eliminado del resumen')
  }

  const handleEditProduct = (index: number) => {
    const productToEdit = productsList[index]

    // Cierra el drawer primero
    onOpenChangeDetailOrderDrawer()

    // Establece el producto seleccionado con todos sus datos, incluyendo la imagen
    setSelectedProduct({
      productId: productToEdit.productId,
      productName: productToEdit.productName,
      quantity: productToEdit.quantity,
      price: productToEdit.price,
      image: productToEdit.image, // Aseguramos que la imagen se mantenga
    })

    // Establece los datos del formulario
    setProductFormData({
      productId: productToEdit.productId.toString(),
      quantity: productToEdit.selectedQuantity,
    })

    // Establece el índice del producto que se está editando
    setEditingProductIndex(index)

    // Limpia el estado para forzar la actualización del Autocomplete
    setProductFormData({ productId: '', quantity: 0 })
    setSelectedProduct(null)

    // Actualiza el estado con el producto a editar después de un breve instante
    setTimeout(() => {
      setEditingProductIndex(index)
      const originalBatch = products.find(
        b => b.productId === productToEdit.productId,
      )
      setSelectedProduct({
        productId: productToEdit.productId,
        productName: productToEdit.productName,
        quantity: originalBatch?.quantity || productToEdit.quantity, // Usar la cantidad original del lote
        price: productToEdit.price,
        image: productToEdit.image,
      })
      setProductFormData({
        productId: String(productToEdit.productId),
        quantity: productToEdit.selectedQuantity,
      })
    }, 50)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault()

    try {
      const response = isEditing
        ? await editOrder(orderId!, movementId!, orderFormData)
        : await createOrder(orderFormData)
      if (response?.errors) {
        return toast.error('Ocurrió un error al procesar la solicitud.')
      }

      toast.success('Orden creada correctamente')
      router.push(paths.orders())
    } catch (error) {
      toast.error('Ocurrió un error al procesar la solicitud.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <FormWrapper
        onSubmit={handleSubmit}
        buttonLabel='Confirmar'
        showScrollShadow={false}
        buttonProps={{
          isLoading,
          isDisabled:
            !orderFormData.customerId || !orderFormData.products.length,
        }}
      >
        <div className='flex flex-col gap-6 w-full'>
          <div className='flex  gap-2 w-full'>
            <Autocomplete
              label='Cliente'
              placeholder='Buscar cliente'
              onSelectionChange={(value: Key | null) =>
                setOrderFormData(prev => ({
                  ...prev,
                  customerId: value ? Number(value) : 0,
                }))
              }
              defaultItems={customers}
              startContent={
                <Search
                  className='text-default-400'
                  strokeWidth={2.5}
                  size={20}
                />
              }
              value={
                orderFormData.customerId ? String(orderFormData.customerId) : ''
              }
              defaultSelectedKey={
                orderFormData.customerId ? String(orderFormData.customerId) : ''
              }
              className='w-full'
            >
              {customers.map(customer => (
                <AutocompleteItem key={customer.id}>
                  {`${capitalize(customer.name)} ${capitalize(
                    customer.lastName,
                  )}`}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Button
              onPress={onOpenCustomerDrawer}
              variant='flat'
              color='primary'
              className='h-full'
            >
              Agregar <br /> Cliente
            </Button>
          </div>
          <Card shadow='none' className='bg-slate-50 p-2'>
            <CardBody className='flex flex-col gap-4'>
              <div className='flex gap-4'>
                <Autocomplete
                  label='Producto'
                  placeholder='Buscar'
                  onSelectionChange={handleChangeProductForm}
                  defaultItems={availableProducts}
                  startContent={
                    <Search
                      className='text-default-400'
                      strokeWidth={2.5}
                      size={20}
                    />
                  }
                  selectedKey={productFormFata.productId}
                  className='w-full'
                >
                  {availableProducts.map(product => (
                    <AutocompleteItem key={product.productId}>
                      {capitalize(product.productName)}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <Input
                  type='number'
                  label='Cantidad'
                  placeholder='Ingresar cantidad'
                  description={
                    selectedProduct
                      ? `Cantidad disponible: ${selectedProduct.quantity}`
                      : 'Seleccione un producto'
                  }
                  disabled={!selectedProduct}
                  min={0}
                  max={selectedProduct?.quantity}
                  value={
                    Number(productFormFata.quantity) !== 0
                      ? String(productFormFata.quantity)
                      : ''
                  }
                  onChange={e =>
                    setProductFormData({
                      ...productFormFata,
                      quantity: Number(e.target.value),
                    })
                  }
                  className='w-full'
                />
              </div>
              <Card shadow='none'>
                <CardBody className='flex justify-between gap-4 flex-row'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-default-600 font-normal text-sm'>
                      Precio unitario:
                    </span>
                    <span className='text-default-900 font-semibold'>
                      {selectedProduct
                        ? `${convertToArgentinePeso(
                            Number(selectedProduct.price),
                          )}`
                        : '$0.00'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-default-600 font-medium text-sm'>
                      Precio total:
                    </span>
                    <span className='text-primary font-bold'>
                      {selectedProduct && productFormFata.quantity
                        ? `${convertToArgentinePeso(
                            Number(selectedProduct.price) *
                              productFormFata.quantity,
                          )}`
                        : '$0.00'}
                    </span>
                  </div>
                </CardBody>
              </Card>
              <Button
                color='primary'
                className='w-full'
                onPress={handleAddProduct}
                isDisabled={
                  !selectedProduct ||
                  !productFormFata.quantity ||
                  productFormFata.quantity <= 0 ||
                  selectedProduct?.quantity < productFormFata.quantity
                }
              >
                {editingProductIndex !== null
                  ? 'Editar producto'
                  : 'Agregar producto'}
              </Button>
            </CardBody>
          </Card>
          <OrderDetail
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            productsList={productsList}
            isOpen={isOpenDetailOrderDrawer}
            onOpenChange={onOpenChangeDetailOrderDrawer}
            total={productsList.reduce(
              (acc, p) => acc + p.price * p.selectedQuantity,
              0,
            )}
          />
        </div>
        <div className='mt-4  flex-1 flex items-end w-full'>
          <Card
            className='flex  w-full flex-col p-4 bg-slate-50 gap-4'
            shadow='none'
          >
            <Button
              isDisabled={productsList.length === 0}
              onPress={onOpenDetailOrderDrawer}
              variant='light'
              color='primary'
              startContent={<EyeIcon size={18} />}
            >
              Ver resumen del pedido
            </Button>
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
          </Card>
        </div>
      </FormWrapper>
      <CustomerForm
        isOpen={isOpenCustomerDrawer}
        onOpenChange={onOpenChangeCustomerDrawer}
      />
    </>
  )
}

import React from 'react'
import OrderForm from '../components/order-form'
import db from '@/lib/db'
import FormPage from '@/components/layout/form-page'

export default async function ShipmentAddPage() {
  const customers = await db.customer.findMany()

  // 1. Obtenemos los lotes agrupados por producto
  const batchs = await db.batch.groupBy({
    by: ['productId'],
    where: {
      marketQuantity: {
        gt: 0,
      },
    },
    _sum: {
      marketQuantity: true,
    },
  })

  // 2. Obtenemos solo los productos que tienen lotes
  const productIds = batchs.map(b => b.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, image: true },
  })

  // --- INICIO DE LA MEJORA ---

  // (Solución al TODO: Mejorar query)
  // Creamos un Map de productos para una búsqueda O(1)
  // Esto es mucho más rápido que usar products.find() dentro del loop
  const productMap = new Map(products.map(p => [p.id, p]))

  // 3. Mapeamos los lotes a la info de producto y ORDENAMOS
  const sortedProducts = batchs
    .map(b => {
      const product = productMap.get(b.productId)
      return {
        productId: b.productId,
        productName: product?.name || 'Producto no encontrado',
        quantity: b._sum.marketQuantity || 0,
        price: product?.price || 0,
        image: product?.image || '',
      }
    })
    .sort((a, b) => a.productName.localeCompare(b.productName)) // <-- AQUÍ SE ORDENA

  // --- FIN DE LA MEJORA ---

  return (
    <FormPage title='Crear Pedido'>
      <OrderForm products={sortedProducts} customers={customers} />
    </FormPage>
  )
}
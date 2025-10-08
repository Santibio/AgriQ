import { getProducts } from '@/services/product.service'
import ProductsList from './components/product-list'
import FormPage from '@/components/layout/form-page'

export default async function PricesPage() {
  const products = await getProducts()
  return (
    <FormPage title='Precios'>
      <ProductsList products={products} />
    </FormPage>
  )
}

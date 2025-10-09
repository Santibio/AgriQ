import ListPage from '@/components/layout/list-page'
import { getSells } from '@/services/sales.service'
import SalesList from './components/sales-list'
import { Sale, Order, Customer, OrderDetail } from '@prisma/client'

type SaleWithOrder = Sale & {
  order: Order & {
    customer: Customer
    details: OrderDetail[]
    sale: Sale
  }
}

export default async function SalesPage() {
  const sales = (await getSells()).filter(
    (sale): sale is SaleWithOrder => sale.order !== null,
  )

  return (
    <ListPage title='Ventas'>
      <SalesList sales={sales} />
    </ListPage>
  )
}

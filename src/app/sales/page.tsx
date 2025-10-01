import ListPage from '@/components/layout/list-page'
import { getSells } from '@/services/sales.service'
import SalesList from './components/sales-list'
import { Sale, Order, Customer, OrderDetail } from '@prisma/client'

type SaleWithOrder = Sale & {
  order: Order & {
    customer: Customer
    details: OrderDetail[]
  }
}

export default async function SalesPage() {
  const sales = (await getSells()).filter(
    (sale): sale is SaleWithOrder => sale.order !== null,
  )

  return (
    <ListPage
      title='Ventas'
      classNameList={{
        containerList: 'w-[120%] px-[10%] ml-[-10%] py-[18px]',
      }}
    >
      <SalesList sales={sales} />
    </ListPage>
  )
}

import ListPage from '@/components/layout/list-page'
import SimulatedSalesChart from './components/SalesChart'
import StockDistribution from './components/StockDistribution'
import TopClientsDonut from './components/TopCustomers'
import ProductionDashboard from './components/ProductionDashboard'
import DiscardDashboard from './components/DiscardDashboard'
import DiscardReasonDonut from './components/DiscardReasonDonut'
import OrderStatusDonut from './components/OrderStatusDonut'
import TopProductsDashboard from './components/TopProductsDashboard'
import OrderCancellationDonut from './components/OrderCancellationDonut'

export default function UsersPage() {
  return (
    <ListPage title='Reportes'>
      <div className='flex gap-4 flex-col'>
        <StockDistribution />
        <ProductionDashboard />
        <DiscardDashboard />
        <DiscardReasonDonut />
        <OrderStatusDonut />
        <OrderCancellationDonut />
        <TopProductsDashboard />
        <SimulatedSalesChart />
        <TopClientsDonut />
      </div>
    </ListPage>
  )
}

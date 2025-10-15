import ListPage from '@/components/layout/list-page'
import SimulatedSalesChart from './components/SalesChart'
import StockDistribution from './components/StockDistribution'
import TopClientsDonut from './components/TopCustomers'
import ProductionDashboard from './components/ProductionDashboard'
import DiscardDashboard from './components/DiscardDashboard'
import DiscardReasonSemiDonut from './components/DiscardReasonSemiDonut'
import OrderStatusDonut from './components/OrderStatusDonut'
import TopProductsDashboard from './components/TopProductsDashboard'
import ProductionReportWithLibrary from './components/ProductionReportWithLibrary'

export default function UsersPage() {
  return (
    <ListPage title='Reportes'>
      <div className='flex gap-4 flex-col'>
        <StockDistribution />
        <ProductionDashboard />
        <DiscardDashboard />
        <DiscardReasonSemiDonut />
        <OrderStatusDonut />
        <TopProductsDashboard />
        <SimulatedSalesChart />
        <TopClientsDonut />
        <ProductionReportWithLibrary />
      </div>
    </ListPage>
  )
}

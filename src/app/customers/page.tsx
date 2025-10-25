import db from '@/lib/db'
import AddButton from '@/components/buttons/add-button'
import ListPage from '@/components/layout/list-page'
import paths from '@/lib/paths'
import CustomerList from './components/customers-list'
import { getCurrentUser } from '@/lib/session'

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: [{ active: 'desc' }, { lastName: 'asc' }],
  })

  const user = await getCurrentUser()

  const canCreateCustomer = user!.role === 'ADMIN' || user!.role === 'SELLER'

  return (
    <ListPage
      title='Clientes'
      actions={
        canCreateCustomer ? (
          <AddButton href={paths.customerAdd()}>Crear cliente</AddButton>
        ) : null
      }
    >
      <CustomerList customers={customers} />
    </ListPage>
  )
}

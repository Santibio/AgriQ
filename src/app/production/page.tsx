import db from '@/lib/db'
import ProductionsList from './components/productions-list'
import paths from '@/lib/paths'
import AddButton from '@/components/buttons/add-button'
import ListPage from '@/components/layout/list-page'
import { getCurrentUser } from '@/lib/session'

export default async function ProductionPage() {
  const productions = await db.batch.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })

  const user = await getCurrentUser()

  const canCreateProduction = user?.role === 'ADMIN' || user?.role === 'DEPOSIT'

  return (
    <ListPage
      title='Producción'
      actions={
        canCreateProduction ? (
          <AddButton href={paths.productionAdd()}>Crear lote</AddButton>
        ) : null
      }
    >
      <ProductionsList productions={productions} />
    </ListPage>
  )
}

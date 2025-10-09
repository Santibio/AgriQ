import ListPage from '@/components/layout/list-page'
import MovementList from '@/components/movements-list'
import { getRecentMovements } from '@/services/movement.service'

export default async function MovementsPage() {
  const recentMovements = await getRecentMovements(99)

  return (
    <ListPage
      title='Movimientos'
    >
      <MovementList movements={recentMovements} />
    </ListPage>
  )
}

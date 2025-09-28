import ListPage from '@/components/layout/list-page'
import MovementList from '@/components/movements-list'
import { getRecentMovements } from '@/services/movement.service'

export default async function MovementsPage() {
  const recentMovements = await getRecentMovements(99)

  return (
    <ListPage
      title='Movimientos'
      classNameList={{
        containerList: 'w-[120%] px-[10%] ml-[-10%] py-[18px]',
      }}
    >
      <MovementList movements={recentMovements} />
    </ListPage>
  )
}

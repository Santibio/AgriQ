import db from '@/lib/db'
import DiscardList from './components/discard-list'
import paths from '@/lib/paths'
import AddButton from '@/components/buttons/add-button'
import ListPage from '@/components/layout/list-page'
import { getCurrentUser } from '@/lib/session'

export default async function Shipments() {
  const filteredMovements = await db.movement.findMany({
    where: {
      type: 'DISCARDED',
    },
    include: {
      movementDetail: {
        include: {
          batch: {
            include: {
              product: true,
            },
          },
        },
      },
      discard: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const user = await getCurrentUser()

  const canCreateDiscard = user?.role === 'ADMIN' || user?.role === 'DEPOSIT'

  return (
    <ListPage
      title='Lista de descartes'
      actions={
        canCreateDiscard ? (
          <AddButton href={paths.discardAdd()}>Crear descarte</AddButton>
        ) : null
      }
    >
      <DiscardList discards={filteredMovements} />
    </ListPage>
  )
}

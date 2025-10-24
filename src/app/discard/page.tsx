import db from '@/lib/db'
import DiscardList from './components/discard-list'
import paths from '@/lib/paths'
import AddButton from '@/components/buttons/add-button'
import ListPage from '@/components/layout/list-page'

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

  return (
    <ListPage
      title='Descartes'
      actions={<AddButton href={paths.discardAdd()}>Crear descarte</AddButton>}
    >
      <DiscardList discards={filteredMovements} />
    </ListPage>
  )
}

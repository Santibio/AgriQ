import paths from '@/lib/paths'
import { Link } from '@heroui/react'
import MovementList from './movements-list'
import { getRecentMovements } from '@/services/movement.service'

const RecentMovements = async () => {
  try {
    const recentMovements = await getRecentMovements()

    if (!recentMovements.length) {
      return null
    }

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Movimientos Recientes
          </h3>
          <Link isBlock size='sm' color='primary' href={paths.movements()}>
            Ver todos
          </Link>
        </div>
        <MovementList movements={recentMovements} />
      </div>
    )
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading recent movements:', error)
    }
    return (
      <div className='p-4 text-center text-red-600'>
        Error al cargar los movimientos recientes
      </div>
    )
  }
}

export default RecentMovements

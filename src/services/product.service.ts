import db from '@/lib/db'

export const getProducts = async () => {
  const response = db.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  return response
}

import { cache } from 'react'
import { validateRequest } from '@/auth'
import db from './db'

export const getCurrentUser = cache(async () => {
  const { userId } = await validateRequest()

  if (!userId) return null

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  })

  return user
})

import { getCurrentUser } from '@/lib/session'
import React from 'react'
import Header from './components/header'

export default async function HeaderServer() {
  const user = await getCurrentUser()

  if (!user) return null

  return <Header user={user} />
}

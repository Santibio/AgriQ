import PageTitle from '@/components/page-title'
import React from 'react'
import UserForm from '../components/user-form'

export default function UserEditPage() {
  return (
    <section className='flex flex-col justify-between gap-6'>
      <PageTitle>Agregar Usuario</PageTitle>
      <UserForm />
    </section>
  )
}

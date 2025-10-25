import React from 'react'
import UserForm from '../components/user-form'
import FormPage from '@/components/layout/form-page'

export default function UserEditPage() {
  return (
    <FormPage title='Crear Usuario'>
      <UserForm />
    </FormPage>
  )
}

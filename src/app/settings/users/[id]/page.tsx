import UserForm from '../components/user-form'
import db from '@/lib/db'
import { notFound } from 'next/navigation'
import FormPage from '@/components/layout/form-page'

interface UserEditPageProps {
  params: Promise<{ id: string }>
}

export default async function UserEditPage(props: UserEditPageProps) {
  const params = await props.params
  const userId = parseInt(params.id)

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) return notFound()

  return (
    <FormPage title='Editar Usuario'>
      <UserForm user={user} />
    </FormPage>
  )
}

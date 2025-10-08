import PageTitle from '@/components/page-title'
import SettingList from './components/setting-list'

export default function UsersPage() {
  return (
    <section className='flex flex-col h-[calc(100vh-150px)] px-4 relative gap-2'>
      <PageTitle>Ajustes</PageTitle>
      <SettingList />
    </section>
  )
}

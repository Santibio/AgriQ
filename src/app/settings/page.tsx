import SettingList from './components/setting-list'
import ListPage from '@/components/layout/list-page'
import { Card, CardBody, Link } from '@heroui/react'
import { ExternalLink, FileText, FolderKanban, BookOpen } from 'lucide-react'

export default function UsersPage() {
  const docs = [
    {
      title: 'Manual de usuario',
      href: 'https://drive.google.com/file/d/17B2IBI7EjhRFR53hwRsIcZm7feGMGY66/view?usp=sharing',
      icon: <BookOpen className='w-5 h-5 text-primary' />,
      description: 'Guía completa para el uso del sistema',
    },
    {
      title: 'Análisis y propuesta de sistema',
      href: 'https://drive.google.com/file/d/1TjCVal0uX_MER6RGfS6Do74XivzCPCh8/view?usp=sharing',
      icon: <FileText className='w-5 h-5 text-secondary' />,
      description: 'Documentación técnica y análisis',
    },
    {
      title: 'Administración del Proyecto',
      href: 'https://drive.google.com/file/d/1tgguC1wnzOfBQo_3qeNV3hkqsiBisXxh/view?usp=sharing',
      icon: <FolderKanban className='w-5 h-5 text-success' />,
      description: 'Gestión y planificación del proyecto',
    },
  ]

  return (
    <ListPage title='Ajustes'>
      <div className='flex min-h-full flex-col'>
        <SettingList />
        <section className='mt-auto pt-8'>
          <h2 className='mb-4 text-xl font-semibold text-slate-800'>
            Documentación
          </h2>
          <div className='grid gap-4'>
            {docs.map((doc, index) => (
              <Card
                key={index}
                shadow='sm'
                isPressable
                as={Link}
                href={doc.href}
                target='_blank'
              >
                <CardBody className='flex flex-row items-center gap-4 p-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100'>
                    {doc.icon}
                  </div>
                  <div className='flex flex-1 flex-col'>
                    <span className='font-medium text-slate-700'>
                      {doc.title}
                    </span>
                    <span className='text-xs text-slate-500'>
                      {doc.description}
                    </span>
                  </div>
                  <ExternalLink className='h-4 w-4 text-slate-400' />
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </ListPage>
  )
}

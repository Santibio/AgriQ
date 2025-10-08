import { Card, CardBody, Divider } from '@heroui/react'
import Link from 'next/link'
import { DollarSign, Users, User, ChevronRight, Apple } from 'lucide-react'
import paths from '@/lib/paths'

const settings = [
  {
    label: 'Precios',
    href: paths.prices(),
    icon: DollarSign,
    color: 'text-green-500',
  },
  {
    label: 'Productos',
    href: paths.products(),
    icon: Apple,
    color: 'text-blue-500',
  },
  {
    label: 'Usuarios',
    href: paths.users(),
    icon: Users,
    color: 'text-blue-500',
  },
  {
    label: 'Perfil',
    href: paths.profile(),
    icon: User,
    color: 'text-purple-500',
  },
]

export default function SettingList() {
  return (
    <Card shadow='sm' className='max-w-md w-full mx-auto mt-10'>
      <CardBody className='p-2'>
        <ul className='flex flex-col'>
          {settings.map(({ label, href, icon: Icon, color }, index) => (
            <li key={href}>
              <Link
                href={href}
                className='flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150'
              >
                <div className='flex items-center gap-3'>
                  <Icon size={20} className={color} />
                  <span className='font-medium text-gray-800 dark:text-gray-100'>
                    {label}
                  </span>
                </div>
                <ChevronRight className='text-slate-500' />
              </Link>

              {index < settings.length - 1 && <Divider />}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

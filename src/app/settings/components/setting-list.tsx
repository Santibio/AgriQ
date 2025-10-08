import { Card, CardBody } from '@heroui/react'
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
    <div className='max-w-md w-full mx-auto mt-6 '>
      {/* Grupo estilo iOS */}
      <Card className='bg-white/70 backdrop-blur-sm border-white/20 h-full'>
        <CardBody className='p-0 divide-y divide-gray-200'>
          {settings.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className='flex items-center justify-between px-5 py-4 active:bg-gray-100 transition-all duration-150'
            >
              <div className='flex items-center gap-3'>
                <Icon
                  size={20}
                  className={`${color} drop-shadow-sm`}
                  strokeWidth={2}
                />
                <span className='font-medium text-gray-900 text-[15px]'>
                  {label}
                </span>
              </div>
              <ChevronRight size={18} className='text-gray-400' />
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}

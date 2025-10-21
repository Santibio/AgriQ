'use client'
import { ReactNode } from 'react'
import PageTitle from '../page-title'
import { ScrollShadow } from '@heroui/react'

interface ListPageProps {
  children: ReactNode
  title: string
  actions?: ReactNode
  hasFilter?: boolean
}

export default function ListPage({ title, actions, children }: ListPageProps) {
  return (
    <section className='flex flex-col   relative gap-2'>
      <div className='flex items-center justify-between px-4 '>
        <PageTitle>{title}</PageTitle>
        <div>{actions}</div>
      </div>
      <ScrollShadow className='p-4 flex-1 pb-20' hideScrollBar>
        {children}
      </ScrollShadow>
    </section>
  )
}

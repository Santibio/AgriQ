import { Button, Link } from '@heroui/react'
import React from 'react'

interface AddButtonProps {
  children: React.ReactNode
  href?: string
  onPress?: () => void
}

export default function AddButton({ children, href, onPress }: AddButtonProps) {
  return (
    <Button
      color='primary'
      variant='solid'
      className='w-full'
      href={href}
      as={Link}
      onPress={onPress}
      size='sm'
    >
      {children}
    </Button>
  )
}

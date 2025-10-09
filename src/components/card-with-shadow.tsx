import { Card } from '@heroui/react'
import { cn } from '@/lib/utils'

interface CardWithShadowProps {
  className?: string
  children: React.ReactNode
  isPressable?: boolean
  isDisabled?: boolean
  as?: React.ElementType
  href?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any
}

export default function CardWithShadow({
  className,
  children,
  isPressable,
  isDisabled,
  as,
  href,
  ...props
}: CardWithShadowProps) {
  return (
    <Card
      className={cn(
        'bg-white/70 backdrop-blur-sm border-white/20 w-full h-full',
        className,
      )}
      isPressable={isPressable}
      isDisabled={isDisabled}
      as={as}
      href={href}
      {...props}
    >
      {children}
    </Card>
  )
}

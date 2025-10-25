import { ReactNode, FormEventHandler } from 'react'
import { Button, Form } from '@heroui/react'

interface FormWrapperProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  buttonLabel: string
  buttonProps?: React.ComponentProps<typeof Button> // para extender props del botón
  showButton?: boolean
  showScrollShadow?: boolean
}

export default function FormWrapper({
  onSubmit,
  children,
  buttonLabel,
  buttonProps,
  showButton = true,
}: FormWrapperProps) {
  return (
    <Form onSubmit={onSubmit} className='flex flex-col justify-between gap-6'>
      {children}
      {showButton && (
        <div className='pb-2 w-full'>
          <Button
            variant='ghost'
            type='submit'
            color='primary'
            fullWidth
            {...buttonProps}
          >
            {buttonLabel}
          </Button>
        </div>
      )}
    </Form>
  )
}

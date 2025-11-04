import React from 'react'

interface WelcomeBannerProps {
  name: string
}

const WelcomeBanner = ({ name = 'Santiago' }: WelcomeBannerProps) => {
  return (
    <div className='space-y-2' suppressHydrationWarning>
      <h2 className='text-2xl font-bold text-gray-900'>¡Buen día, {name}!</h2>
      <p className='text-gray-600'>Aquí tienes un resumen de datos semanales</p>
    </div>
  )
}

export default WelcomeBanner

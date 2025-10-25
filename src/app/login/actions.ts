'use server'

import db from '@/lib/db'
import paths from '@/lib/paths'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { compareHash } from '@/lib/helpers/encryptions'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: 'El nombre de usuario debe tener al menos 3 caracteres',
    })
    .regex(/[a-z-]/, {
      message: 'Solo minisculas y sin espacios en blanco',
    }),
  password: z
    .string()
    .min(1, { message: 'La contraseña debe tener al menos 1 caracter' }),
})

interface LoginFormState {
  errors: {
    username?: string[]
    password?: string[]
    _form?: string[]
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey'

export async function login(
  _: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const result = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { username, password } = result.data

  const user = await db.user.findUnique({ where: { username, active: true } })

  if (!user) {
    return {
      errors: {
        username: ['No se encontro el usuario, contacte al administrador'],
      },
    }
  }

  const passwordMatch = await compareHash(password, user.password)

  if (!passwordMatch) {
    return {
      errors: {
        password: ['Contaseña incorrecta'],
      },
    }
  }

  // Generar JWT
  const token = jwt.sign({ userId: user.id, userRole: user.role }, JWT_SECRET, {
    expiresIn: '30d',
  })

  // Configurar la cookie con el JWT
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'token',
    value: token,
    path: '/', // Disponible en toda la aplicación
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  })

  revalidatePath('/')
  redirect(paths.home())
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  revalidatePath('/')
  redirect(paths.login())
}

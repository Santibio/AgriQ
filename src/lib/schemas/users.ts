import { z } from 'zod'

// --- 1. Definimos la validación de contraseña reutilizable ---
const passwordValidation = z
  .string()
  .min(8, { message: 'Mínimo 8 caracteres' })
  .regex(/[a-z]/, { message: 'Debe contener al menos una minúscula' })
  .regex(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  .regex(/[0-9]/, { message: 'Debe contener al menos un número' })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Debe contener al menos un carácter especial (ej. !@#$%*)',
  })

// --- 2. Esquema para AÑADIR (la contraseña es obligatoria) ---
export const UserAddFormSchema = z
  .object({
    username: z.string().min(1, { message: 'Campo requerido' }),
    role: z.string().min(1, { message: 'Campo requerido' }),
    lastName: z.string().min(1, { message: 'Campo requerido' }),
    name: z.string().min(1, { message: 'Campo requerido' }),
    avatar: z.instanceof(File).optional(),
    active: z.boolean().optional(),

    // Usamos la validación robusta
    password: passwordValidation,

    // El campo de confirmación solo necesita existir
    confirmPassword: z
      .string()
      .min(1, { message: 'Por favor, confirma tu contraseña' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type AddInputs = z.infer<typeof UserAddFormSchema>

// --- 3. Esquema para EDITAR (la contraseña es opcional) ---
export const UserEditFormSchema = z
  .object({
    username: z.string().optional(),
    role: z.string().min(1, { message: 'Campo requerido' }),
    lastName: z.string().min(1, { message: 'Campo requerido' }),
    name: z.string().min(1, { message: 'Campo requerido' }),
    avatar: z.instanceof(File).optional(),
    active: z.boolean().optional(),

    // La contraseña puede ser:
    // 1. undefined (si no se envía)
    // 2. Un string vacío "" (si el usuario la borra)
    // 3. Un string que CUMPLE la validación robusta
    password: z.union([z.literal(''), passwordValidation]).optional(),

    // El campo de confirmación es opcional
    confirmPassword: z.string().optional(),
  })
  // El `.refine` debe ser condicional
  .refine(
    data => {
      // Si el campo de contraseña está vacío o no se definió,
      // no es necesario que coincidan.
      if (!data.password) {
        return true
      }
      // Si se escribió algo en 'password', ENTONCES deben coincidir
      return data.password === data.confirmPassword
    },
    {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    },
  )

export type EditInputs = z.infer<typeof UserEditFormSchema>

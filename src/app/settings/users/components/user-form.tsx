'use client'

import { useForm, Controller } from 'react-hook-form'
import {
  Avatar,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { Camera, Eye, EyeOff } from 'lucide-react'
import type { User } from '@prisma/client'
import {
  AddInputs,
  EditInputs,
  UserAddFormSchema,
  UserEditFormSchema,
} from '@/lib/schemas/users'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { usernameGenerator } from '@/lib/helpers/user'
import { addUser, editUser } from '../actions'
import paths from '@/lib/paths'
import { useRouter } from 'next/navigation'
import config from '@/config'
import FormWrapper from '@/components/layout/form-wrapper'

interface UserFormProps {
  user?: User
}

interface VisibilityState {
  password: boolean
  confirmPassword: boolean
}

export default function UserForm({ user }: UserFormProps) {
  const isEditing = Boolean(user)
  type FormInputs = typeof isEditing extends boolean ? AddInputs : EditInputs

  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<FormInputs>({
    resolver: zodResolver(isEditing ? UserEditFormSchema : UserAddFormSchema),
    mode: 'onChange',
    defaultValues: {
      username: user?.username || '',
      role: user?.role || '',
      password: '',
      confirmPassword: '',
      lastName: user?.lastName || '',
      name: user?.name || '',
      avatar: undefined,
      active: isEditing ? user?.active : true,
    },
  })

  const [isVisible, setIsVisible] = useState<VisibilityState>({
    password: false,
    confirmPassword: false,
  })

  const [isLoading, setIsloading] = useState<boolean>(false)
  const [preview, setPreview] = useState<string>(user?.avatar || '')

  // Effect to update username whenever name or lastName changes
  useEffect(() => {
    if (!isEditing) {
      const name = watch('name')
      const lastName = watch('lastName')
      const username = usernameGenerator(name, lastName)
      setValue('username', username)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [watch('name'), watch('lastName'), isEditing])

  const onSubmit = async (data: FormInputs) => {
    const isValid = await trigger()
    if (!isValid) return // Si hay errores, no envía el form

    const formData = new FormData()
    const fields = [
      ['username', data.username],
      ['role', data.role],
      ['password', data.password],
      ['confirmPassword', data.confirmPassword],
      ['lastName', data.lastName],
      ['name', data.name],
      ['active', data.active ? 'true' : 'false'],
    ]

    fields.forEach(([key, value]) => formData.append(key, value))
    if (data.avatar) formData.append('avatar', data.avatar)

    setIsloading(true)

    try {
      const response =
        isEditing && user?.id
          ? await editUser(user.id, formData)
          : await addUser(formData)

      if (response?.errors) {
        return toast.error(
          'Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe.',
        )
      }

      toast.success(
        isEditing
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
      )
      router.push('/' + paths.users())
    } catch (error) {
      toast.error(
        'Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe.',
      )
    } finally {
      setIsloading(false)
    }
  }

  return (
    <FormWrapper
      onSubmit={handleSubmit(onSubmit)}
      buttonLabel='Confirmar'
      buttonProps={{
        isDisabled: isLoading,
        isLoading,
      }}
    >
      <div className='flex flex-col gap-4 w-full'>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label='Nombre'
              placeholder='Ingresar nombre'
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              onChange={e => {
                const onlyLetters = e.target.value.replace(
                  /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g,
                  '',
                )
                e.target.value = onlyLetters
                field.onChange(e)
              }}
            />
          )}
        />
        <Controller
          name='lastName'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label='Apellido'
              placeholder='Ingresar apellido'
              isRequired
              isInvalid={!!errors.lastName}
              errorMessage={errors.lastName?.message}
              onChange={e => {
                const onlyLetters = e.target.value.replace(
                  /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g,
                  '',
                )
                e.target.value = onlyLetters
                field.onChange(e)
              }}
            />
          )}
        />
        <div className='flex gap-4'>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={isEditing ? 'Nueva contraseña' : 'Contraseña'}
                placeholder={
                  isEditing
                    ? 'Ingresar nueva contraseña'
                    : 'Ingresar  contraseña'
                }
                isRequired={!isEditing}
                type={isVisible.password ? 'text' : 'password'}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                endContent={
                  <button
                    aria-label='toggle password visibility'
                    className='focus:outline-none'
                    type='button'
                    onClick={() =>
                      setIsVisible(prev => ({
                        ...prev,
                        password: !prev.password,
                      }))
                    }
                  >
                    {isVisible.password ? (
                      <Eye className='w-[18px] text-default-400 pointer-events-none' />
                    ) : (
                      <EyeOff className='w-[18px] text-default-400 pointer-events-none' />
                    )}
                  </button>
                }
              />
            )}
          />
          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label='Confirmar contraseña'
                placeholder='Confirmar contraseña'
                isRequired={!isEditing}
                type={isVisible.confirmPassword ? 'text' : 'password'}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                endContent={
                  <button
                    aria-label='toggle password visibility'
                    className='focus:outline-none'
                    type='button'
                    onClick={() =>
                      setIsVisible(prev => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }))
                    }
                  >
                    {isVisible.confirmPassword ? (
                      <Eye className='w-[18px] text-default-400 pointer-events-none' />
                    ) : (
                      <EyeOff className='w-[18px] text-default-400 pointer-events-none' />
                    )}
                  </button>
                }
              />
            )}
          />
        </div>
        <Controller
          name='role'
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label='Rol'
              placeholder='Tipo de usuario'
              isRequired
              isInvalid={!!errors.role}
              errorMessage={errors.role?.message}
              selectedKeys={[field.value]}
            >
              {config.roles.map(role => (
                <SelectItem key={role.id}>{role.label}</SelectItem>
              ))}
            </Select>
          )}
        />
        <div className='flex gap-2'>
          <Controller
            name='username'
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  isDisabled
                  label='Usuario'
                  placeholder='Se genera automaticamente'
                  isInvalid={!!errors.username}
                  errorMessage={errors.username?.message}
                />
              )
            }}
          />
          <Controller
            name='avatar'
            control={control}
            render={({ field: { onChange, onBlur, ref, value } }) => {
              return (
                <Button
                  isIconOnly
                  variant='flat'
                  className='h-[-webkit-fill-available] min-w-[60px] bg-default-100'
                >
                  <label className=''>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          onChange(file) // Asigna el archivo al estado del formulario
                          const objectUrl = URL.createObjectURL(file) // Crea una URL de objeto para la imagen
                          setPreview(objectUrl) // Almacena la URL para mostrarla en el avatar
                        }
                      }}
                      onBlur={onBlur}
                      ref={ref}
                      className='hidden'
                    />
                    {value || preview ? (
                      <Avatar src={preview} fallback />
                    ) : (
                      <Camera className='stroke-slate-300' />
                    )}
                  </label>
                </Button>
              )
            }}
          />
        </div>
        {isEditing && (
          <Controller
            name='active'
            control={control}
            render={({ field: { value, onChange, ...field } }) => {
              return (
                <div className='flex items-center gap-2 justify-between'>
                  <p className=' font-semibold'>Activo</p>
                  <Switch
                    {...field}
                    isSelected={value}
                    onValueChange={newValue => onChange(newValue)}
                    size='sm'
                  />
                </div>
              )
            }}
          />
        )}
      </div>
    </FormWrapper>
  )
}

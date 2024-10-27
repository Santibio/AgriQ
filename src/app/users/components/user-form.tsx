"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Avatar,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import type { User } from "@prisma/client";
import {
  AddInputs,
  EditInputs,
  UserAddFormSchema,
  UserEditFormSchema,
} from "@/libs/schemas/users";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { usernameGenerator } from "@/libs/helpers/user";
import { addUser, editUser } from "../actions";

const roles = [
  { id: "administrator", label: "Administrador" },
  { id: "deposit", label: "Deposito" },
  { id: "sells", label: "Ventas" },
];

interface UserFormProps {
  user?: User;
}

interface VisibilityState {
  password: boolean;
  confirmPassword: boolean;
}

export default function UserForm({ user }: UserFormProps) {
  const isEditing = Boolean(user);
  type FormInputs = typeof isEditing extends boolean ? AddInputs : EditInputs;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormInputs>({
    resolver: zodResolver(isEditing ? UserEditFormSchema : UserAddFormSchema),
    defaultValues: {
      username: user?.username || "",
      role: user?.role || "",
      password: "",
      confirmPassword: "",
      lastName: user?.lastName || "",
      name: user?.name || "",
      avatar: undefined,
      active: user?.active,
    },
  });

  const [isVisible, setIsVisible] = useState<VisibilityState>({
    password: false,
    confirmPassword: false,
  });

  const [isLoading, setIsloading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>(user?.avatar || "");

  // Effect to update username whenever name or lastName changes
  useEffect(() => {
    const name = watch("name");
    const lastName = watch("lastName");
    const username = usernameGenerator(name, lastName);
    setValue("username", username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("name"), watch("lastName")]);

  const onSubmit = async (data: FormInputs) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("role", data.role);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      formData.append("lastName", data.lastName);
      formData.append("name", data.name);
      formData.append("active", data.active ? "true" : "false");
      if (data.avatar) formData.append("avatar", data.avatar);

      setIsloading(true);

      let response;
      if (isEditing && user?.id) {
        response = await editUser(user.id, formData);
      } else {
        response = await addUser(formData);
      }

      if (response?.errors?._form) return toast.error(response.errors._form[0]);
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="h-[70dvh] flex flex-col gap-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Nombre"
              placeholder="Ingresar nombre"
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Apellido"
              placeholder="Ingresar apellido"
              isRequired
              isInvalid={!!errors.lastName}
              errorMessage={errors.lastName?.message}
            />
          )}
        />
        <div className="flex gap-4">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={isEditing ? "Nueva contraseña" : "Contraseña"}
                placeholder={
                  isEditing
                    ? "Ingresar nueva contraseña"
                    : "Ingresar  contraseña"
                }
                isRequired
                type={isVisible.password ? "text" : "password"}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() =>
                      setIsVisible((prev) => ({
                        ...prev,
                        password: !prev.password,
                      }))
                    }
                  >
                    {isVisible.password ? (
                      <Eye className="w-[18px] text-default-400 pointer-events-none" />
                    ) : (
                      <EyeOff className="w-[18px] text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Confirmar contraseña"
                placeholder="Confirmar contraseña"
                isRequired
                type={isVisible.confirmPassword ? "text" : "password"}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() =>
                      setIsVisible((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }))
                    }
                  >
                    {isVisible.confirmPassword ? (
                      <Eye className="w-[18px] text-default-400 pointer-events-none" />
                    ) : (
                      <EyeOff className="w-[18px] text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            )}
          />
        </div>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Rol"
              placeholder="Tipo de usuario"
              isRequired
              isInvalid={!!errors.role}
              errorMessage={errors.role?.message}
              selectedKeys={[field.value]}
            >
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label}
                </SelectItem>
              ))}
            </Select>
          )}
        />
        <div className="flex gap-2">
          <Controller
            name="username"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  isDisabled
                  label="Usuario"
                  placeholder="Se genera automaticamente"
                  isInvalid={!!errors.username}
                  errorMessage={errors.username?.message}
                />
              );
            }}
          />
          <Controller
            name="avatar"
            control={control}
            render={({ field: { onChange, onBlur, ref, value } }) => {
              return (
                <Button
                  isIconOnly
                  variant="flat"
                  className="h-full w min-w-[50px] bg-default-100"
                >
                  <label className="">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file); // Asigna el archivo al estado del formulario
                          const objectUrl = URL.createObjectURL(file); // Crea una URL de objeto para la imagen
                          setPreview(objectUrl); // Almacena la URL para mostrarla en el avatar
                        }
                      }}
                      onBlur={onBlur}
                      ref={ref}
                      className="hidden"
                    />
                    {value || preview ? (
                      <Avatar src={preview} fallback />
                    ) : (
                      <Camera className="stroke-slate-300" />
                    )}
                  </label>
                </Button>
              );
            }}
          />
        </div>
        <Controller
          name="active"
          control={control}
          render={({ field: { value, onChange, ...field } }) => {
            return (
              <div className="flex items-center gap-2 justify-between">
                <p className=" font-semibold">Activo</p>
                <Switch
                  {...field}
                  isSelected={value}
                  onValueChange={(newValue) => onChange(newValue)}
                  size="sm"
                />
              </div>
            );
          }}
        />
      </div>
      <Button
        isLoading={isLoading}
        type="submit"
        color="primary"
        variant="ghost"
        className="w-full mt-6"
      >
        Confirmar
      </Button>
    </form>
  );
}

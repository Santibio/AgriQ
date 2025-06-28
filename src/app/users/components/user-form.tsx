"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Avatar,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
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
import { toast } from "sonner";
import { usernameGenerator } from "@/libs/helpers/user";
import { addUser, editUser } from "../actions";
import paths from "@/libs/paths";
import { useRouter } from "next/navigation";
import config from "@/config";


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

  const router = useRouter();

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
      active: isEditing ? user?.active : true,
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
    const formData = new FormData();
    const fields = [
      ["username", data.username],
      ["role", data.role],
      ["password", data.password],
      ["confirmPassword", data.confirmPassword],
      ["lastName", data.lastName],
      ["name", data.name],
      ["active", data.active ? "true" : "false"],
    ];

    fields.forEach(([key, value]) => formData.append(key, value));
    if (data.avatar) formData.append("avatar", data.avatar);

    setIsloading(true);

    try {
      const response =
        isEditing && user?.id
          ? await editUser(user.id, formData)
          : await addUser(formData);

      if (response?.errors) {
        const errorMessage =
          response.errors._form?.[0] || "An unexpected error occurred.";
        return toast.error(errorMessage);
      }

      toast.success(
        isEditing
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );
      router.push(paths.users());
    } catch (error) {
      console.error("Error: ", error);
      toast.error("An unexpected error occurred.");
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
              {config.roles.map((role) => (
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
        {isEditing && (
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
        )}
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

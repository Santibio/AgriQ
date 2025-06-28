"use client";

import { useForm, Controller } from "react-hook-form";
import { Button, Input, Switch } from "@nextui-org/react";
import { useState } from "react";
import { CloudUpload } from "lucide-react";
import type { Product } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AddProductFormSchema,
  AddProductInputs,
  EditProductFormSchema,
  EditProductInputs,
} from "@/libs/schemas/products";
import { addProduct, editProduct } from "../actions";
import { capitalize } from "@/libs/helpers/text";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const isEditing = Boolean(product);
  type FormInputs = typeof isEditing extends boolean
    ? AddProductInputs
    : EditProductInputs;

  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(
      isEditing ? EditProductFormSchema : AddProductFormSchema
    ),
    defaultValues: {
      name: capitalize(product?.name) || "",
      price: product?.price || 0,
      active: product?.active !== undefined ? product.active : true,
      image: undefined,
    },
  });

  const [isLoading, setIsloading] = useState<boolean>(false);

  const onSubmit = async ({ name, active, image, price }: AddProductInputs) => {
    console.log("price: ", price);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("active", String(active));
    formData.append("price", String(price));
    if (image) formData.append("image", image);

    setIsloading(true);
    try {
      const response =
        isEditing && product?.id
          ? await editProduct(product.id, formData)
          : await addProduct(formData);
      if (response?.errors) {
        console.error(response.errors);
        toast.error(
          response.errors._form?.[0] || "An unexpected error occurred."
        );
      } else {
        toast.success(
          isEditing
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente"
        );
        router.push(paths.products());
      }
    } catch (error) {
      console.error(error);
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
              placeholder="Ingresar nombre producto"
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value !== undefined ? String(field.value) : ""}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? "" : Number(value));
              }}
              label="Precio x unidad"
              placeholder="Ingresar precio del producto"
              isRequired
              isInvalid={!!errors.price}
              errorMessage={errors.price?.message}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">$</span>
                </div>
              }
              type="number"
            />
          )}
        />
        <Controller
          name="active"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <div className="flex items-center gap-2 justify-between">
              <p className=" font-semibold">Activo</p>
              <Switch
                {...field}
                isSelected={value}
                onValueChange={(newValue) => onChange(newValue)}
                size="sm"
              />
            </div>
          )}
        />
        <Controller
          name="image"
          control={control}
          render={({ field: { onChange, onBlur, ref, value } }) => {
            const isError = errors.image;
            return (
              <div className="flex items-center justify-center w-full">
                <label
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer text-gray-500 hover:bg-slate-100 hover:dark:bg-slate-900 ${
                    isError ? "border-red-500 text-red-600" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudUpload
                      className={`text-gray-500 ${
                        isError ? "text-red-600" : ""
                      }`}
                    />
                    <p
                      className={`mb-2 text-sm text-gray-500 dark:text-gray-400 ${
                        isError ? "text-red-600" : ""
                      }`}
                    >
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p
                      className={`text-xs text-gray-500 dark:text-gray-400 ${
                        isError ? "text-red-600" : ""
                      }`}
                    >
                      JPG Format (MAX. 800x400px)
                    </p>
                    {value?.name && (
                      <p className="text-xs text-gray-500">
                        Nombre del archivo: <span> {value.name}</span>
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file); // Asigna el archivo seleccionado al estado del formulario
                    }}
                    onBlur={onBlur}
                    ref={ref}
                    className="hidden"
                  />
                </label>
              </div>
            );
          }}
        />
      </div>
      <Button
        type="submit"
        color="primary"
        variant="ghost"
        className="w-full mt-6"
        isLoading={isLoading}
      >
        Confirmar
      </Button>
    </form>
  );
}

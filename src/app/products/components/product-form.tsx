"use client";

import { useForm, Controller } from "react-hook-form";
import { Button, Input, ScrollShadow, Select, SelectItem, Switch } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { CloudUpload } from "lucide-react";
import type { Product } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AddProductFormSchema,
  AddProductInputs,
  EditProductFormSchema,
  EditProductInputs,
} from "@/lib/schemas/products";
import { addProduct, editProduct } from "../actions";
import { capitalize } from "@/lib/helpers/text";
import { useRouter } from "next/navigation";
import paths from "@/lib/paths";
import config from "@/config";

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
    watch,
    setValue,
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
      category: product?.category || "",
      type: product?.type || "",
      presentation: product?.presentation || "",
    },
  });

  const selectedCategory = watch("category");
  const selectedType = watch("type");

  const [isLoading, setIsloading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditing) return;
    setValue("type", "");
    setValue("presentation", "");
  }, [selectedCategory, setValue]);

  useEffect(() => {
    if (isEditing) return;
    setValue("presentation", "");
  }, [selectedType, setValue]);

  const typesForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return config.productCategories.find((cat) => cat.id === selectedCategory)?.type || [];
  }, [selectedCategory]);

  const presentationsForType = useMemo(() => {
    if (!selectedType) return [];
    return typesForCategory.find((t) => t.id === selectedType)?.presentation || [];
  }, [selectedType, typesForCategory]);

  const onSubmit = async ({ name, active, image, price, category, type, presentation }: AddProductInputs) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("active", String(active));
    formData.append("price", String(price));
    formData.append("category", String(category));
    formData.append("type", String(type));
    formData.append("presentation", String(presentation));
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between h-[calc(100vh-205px)]">
      <ScrollShadow className="pb-1 flex-1 w-full flex gap-4 flex-col">
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
        <div className="flex gap-4">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label="Categoria"
                placeholder="Selecciona la categoria"
                selectedKeys={field.value ? [field.value] : []}
                onChange={field.onChange}
                isRequired
                isDisabled={isEditing}
              >
                {config.productCategories.map((category) => (
                  <SelectItem key={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Tipo"
                placeholder="Selecciona el tipo"
                selectedKeys={field.value ? [field.value] : []}
                onChange={field.onChange}
                isRequired
                isDisabled={!selectedCategory || isEditing}
              >
                {typesForCategory.map((type) => (
                  <SelectItem key={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>
        <Controller
          name="presentation"
          control={control}
          render={({ field }) => (
            <Select
              label="Presentación"
              placeholder="Selecciona la presentación"
              selectedKeys={field.value ? [field.value] : []}
              onChange={field.onChange}
              isRequired
              isDisabled={!selectedType || isEditing}
            >
              {presentationsForType.map((presentation) => (
                <SelectItem key={presentation.id}>
                  {presentation.label}
                </SelectItem>
              ))}
            </Select>
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
            // Validación de formato y tamaño
            const handleFileChange = (
              e: React.ChangeEvent<HTMLInputElement>
            ) => {
              const file = e.target.files?.[0];
              if (file) {
                const validTypes = [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/jpg",
                ];
                const maxSize = 1024 * 1024 * 2; // 2MB
                const img = new window.Image();
                const url = URL.createObjectURL(file);
                img.onload = function () {
                  if (file.size > maxSize) {
                    toast.error("La imagen supera el tamaño máximo de 2MB.");
                    return;
                  }
                  if (!validTypes.includes(file.type)) {
                    toast.error("Formato de imagen no soportado.");
                    return;
                  }
                  onChange(file);
                };
                img.onerror = function () {
                  toast.error("No se pudo cargar la imagen.");
                };
                img.src = url;
                toast.success("Imagen cargada correctamente.");
              }
            };
            return (
              <label
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer text-gray-500 hover:bg-slate-100 hover:dark:bg-slate-900 ${isError ? "border-red-500 text-red-600" : ""}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <CloudUpload className={`text-gray-500 ${isError ? "text-red-600" : ""}`} />
                  <p className={`mb-2 text-sm text-gray-500 dark:text-gray-400 ${isError ? "text-red-600" : ""}`}>
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 ${isError ? "text-red-600" : ""}`}>
                    Formats: JPG, JPEG, PNG, WEBP (MAX 2MB)
                  </p>
                  {value?.name && <p className="text-xs text-gray-500">File: {value.name}</p>}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  onBlur={onBlur}
                  ref={ref}
                  className="hidden"
                />
              </label>
            );
          }}
        />
      </ScrollShadow>
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

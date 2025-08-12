"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Button, Input, Select, SelectItem, Switch } from "@nextui-org/react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Customer } from "@prisma/client";
import {
  CustomerAddFormSchema,
  CustomerEditFormSchema,
  CustomerAddInputs,
  CustomerEditInputs,
} from "@/libs/schemas/customers";
import { addCustomer, editCustomer } from "../actions";
import paths from "@/libs/paths";

interface CustomerFormProps {
  customer?: Customer;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const isEditing = Boolean(customer);
  type FormInputs = CustomerAddInputs | CustomerEditInputs;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string>(customer?.avatar || "");

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormInputs>({
    resolver: zodResolver(isEditing ? CustomerEditFormSchema : CustomerAddFormSchema),
    mode: "onChange",
    defaultValues: {
      name: customer?.name || "",
      lastName: customer?.lastName || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      fiscalCondition: (customer?.fiscalCondition as any) || "",
      avatar: undefined,
      active: isEditing ? customer?.active : true,
    } as any,
  });

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onSubmit = async (FormInputs) => {
    const valid = await trigger();
    if (!valid) return;

    const hasFile = (data as any).avatar instanceof File;

    let payload: FormData | Record<string, any>;
    if (hasFile) {
      const fd = new FormData();
      fd.append("name", (data as any).name ?? "");
      fd.append("lastName", (data as any).lastName ?? "");
      fd.append("phone", (data as any).phone ?? "");
      fd.append("email", (data as any).email ?? "");
      fd.append("fiscalCondition", (data as any).fiscalCondition ?? "");
      fd.append("active", ((data as any).active ? "true" : "false"));
      if ((data as any).avatar) fd.append("avatar", (data as any).avatar);
      payload = fd;
    } else {
      payload = {
        name: (data as any).name ?? "",
        lastName: (data as any).lastName ?? "",
        phone: (data as any).phone ?? "",
        email: (data as any).email ?? "",
        fiscalCondition: (data as any).fiscalCondition ?? "",
        active: (data as any).active ?? true,
      };
    }

    setIsLoading(true);
    try {
      const response = isEditing && customer?.id
        ? await editCustomer(customer.id, payload as any)
        : await addCustomer(payload as any);

      if (response?.errors) {
        toast.error("Error processing request. Check data and try again.");
        return;
      }

      toast.success(isEditing ? "Customer updated" : "Customer created");
      router.push(paths.customers());
    } catch (err) {
      console.error(err);
      toast.error("Error processing request.");
    } finally {
      setIsLoading(false);
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
              label="Name"
              placeholder="Enter name"
              isRequired
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message as string}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                e.target.value = onlyLetters;
                field.onChange(e);
              }}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Last name"
              placeholder="Enter last name"
              isRequired
              isInvalid={!!errors.lastName}
              errorMessage={errors.lastName?.message as string}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                e.target.value = onlyLetters;
                field.onChange(e);
              }}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Phone"
              placeholder="Phone (max 13 chars)"
              isInvalid={!!errors.phone}
              errorMessage={errors.phone?.message as string}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d+]/g, "").slice(0, 13);
                e.target.value = val;
                field.onChange(e);
              }}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Email"
              placeholder="example@mail.com"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message as string}
            />
          )}
        />

        <Controller
          name="fiscalCondition"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Fiscal condition"
              placeholder="Select fiscal condition"
              isRequired
              isInvalid={!!errors.fiscalCondition}
              errorMessage={errors.fiscalCondition?.message as string}
              selectedKeys={[field.value]}
            >
              <SelectItem value="RESPONSIBLE">Responsable Inscripto</SelectItem>
              <SelectItem value="MONOTAX">Monotributista</SelectItem>
              <SelectItem value="FINAL_CONSUMER">Consumidor Final</SelectItem>
              <SelectItem value="EXEMPT">Exento</SelectItem>
            </Select>
          )}
        />

        <div className="flex gap-2 items-center">
          <Controller
            name="avatar"
            control={control}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <Button isIconOnly variant="flat" className="h-full min-w-[50px] bg-default-100">
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      onChange(file);
                      const url = URL.createObjectURL(file);
                      setPreview(url);
                    }}
                    onBlur={onBlur}
                    ref={ref}
                    className="hidden"
                  />
                  {value || preview ? <Avatar src={preview} fallback /> : <Camera className="stroke-slate-300" />}
                </label>
              </Button>
            )}
          />
          <Controller
            name="active"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <div className="flex items-center gap-2">
                <p className="font-semibold">Active</p>
                <Switch {...field} isSelected={value} onValueChange={(v) => onChange(v)} size="sm" />
              </div>
            )}
          />
        </div>
      </div>

      <Button isLoading={isLoading} type="submit" color="primary" variant="ghost" className="w-full mt-6">
        Confirm
      </Button>
    </form>
  );
}
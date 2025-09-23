"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useMemo, useState } from "react";
import { addCustomer, editCustomer } from "../actions";
import { toast } from "sonner";
import paths from "@/libs/paths";
import { useRouter } from "next/navigation";
import config from "@/config";
import { Customer } from "@prisma/client";

interface CustomerFormProps {
  customer?: Customer;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const isEditing = Boolean(customer);

  const router = useRouter();

  const [customerForm, setCustmerForm] = useState({
    name: customer?.name || "",
    lastName: customer?.lastName || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    fiscalCondition: customer?.fiscalCondition || "",
  });
  const [isLoading, setIsloading] = useState<boolean>(false);

  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustmerForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePhoneNumber = (value: string) => value.match(/^\+?\d{7,15}$/);

  const isInvalid = useMemo(() => {
    if (customerForm.phone === "") return false;

    return validatePhoneNumber(customerForm.phone) ? false : true;
  }, [customerForm.phone]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsloading(true);

    const formData = new FormData();
    formData.append("name", customerForm.name);
    formData.append("lastName", customerForm.lastName);
    formData.append("email", customerForm.email);
    formData.append("phone", customerForm.phone);
    formData.append("fiscalCondition", customerForm.fiscalCondition);

    try {
      const response = isEditing
        ? await editCustomer(Number(customer?.id), formData)
        : await addCustomer(formData);

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Cliente agregado correctamente");

      router.push(paths.customers());
    } catch (error) {
      console.error("Error: ", error);
      toast.error(
        "Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe."
      );
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="h-[70dvh] flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre / Alias"
            placeholder="Ingresar nombre"
            name="name"
            onChange={handleOnchange}
            value={customerForm.name}
            isRequired
          />
          <Input
            label="Apellido"
            placeholder="Ingresar apellido"
            name="lastName"
            onChange={handleOnchange}
            value={customerForm.lastName}
          />
        </div>
        <Input
          label="Email"
          placeholder="Ingresar email"
          name="email"
          onChange={handleOnchange}
          value={customerForm.email}
          isRequired
          type="email"
        />
        <Input
          label="Teléfono"
          placeholder="Ingresar teléfono"
          name="phone"
          onChange={handleOnchange}
          value={customerForm.phone}
          isInvalid={isInvalid}
          color={isInvalid ? "danger" : undefined}
          errorMessage="Ingresa un teléfono válido"
        />
        <Select
          label="Información fiscal"
          labelPlacement="outside"
          name="fiscalCondition"
          placeholder="Selecciona la condición fiscal"
          value={customerForm.fiscalCondition}
          onChange={handleOnchange}
          defaultSelectedKeys={[customerForm.fiscalCondition]}
          className="mt-5"
          isRequired
        >
          {config.fiscalInformation.map((info) => (
            <SelectItem key={info.id}>{info.label}</SelectItem>
          ))}
        </Select>
        <Button
          isLoading={isLoading}
          type="submit"
          color="primary"
          variant="ghost"
          className="w-full mt-auto"
        >
          {isEditing ? "Editar Cliente" : "Agregar Cliente"}
        </Button>
      </form>
    </div>
  );
}

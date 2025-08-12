"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";

export default function CustomerForm() {
  const [customerForm, setCustmerForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  });


  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustmerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    /* TODO: Ver como mandar a la DB - tip usar las actions */
    console.log("Mandar esto a la DB: ", customerForm);
  };

  /* Darle estilos */
  /* Agregar validaciones */

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          placeholder="Ingresar nombre"
          name="name"
          onChange={handleOnchange}
          value={customerForm.name}
        />
        <Input
          label="Apellido"
          placeholder="Ingresar nombre"
          name="lastName"
          onChange={handleOnchange}
          value={customerForm.lastName}
        />
        <Input
          label="Email"
          placeholder="Ingresar email"
          name="email"
          onChange={handleOnchange}
          value={customerForm.email}
        />
        <Input
          label="Teléfono"
          placeholder="Ingresar teléfono"
          name="phone"
          onChange={handleOnchange}
          value={customerForm.phone}
        />
        <Button type="submit" className="mt-4">
          Guardar Cliente
        </Button>
      </form>
    </div>
  );
}

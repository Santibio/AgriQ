import React from "react";
import ProductForm from "../components/product-form";
import FormPage from "@/components/layout/form-page";

export default function UserEditPage() {
  return (
    <FormPage title="Crear Producto">
      <ProductForm />
    </FormPage>
  );
}

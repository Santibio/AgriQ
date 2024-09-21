import PageTitle from "@/components/page-title";
import React from "react";
import ProductForm from "../components/product-form";

export default function UserEditPage() {
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Agregar Producto</PageTitle>
      <ProductForm />
    </section>
  );
}

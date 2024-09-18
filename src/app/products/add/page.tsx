import PageTitle from "@/components/page-title";
import ProductForm from "@/components/products/product-form";
import React from "react";

export default function UserEditPage() {
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Agregar Producto</PageTitle>
      <ProductForm />
    </section>
  );
}

import db from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";
import ProductForm from "../components/product-form";
import FormPage from "@/components/layout/form-page";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage(props: ProductEditPageProps) {
  const params = await props.params;
  const productId = parseInt(params.id);

  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) return notFound();
  return (
    <FormPage title="Editar Producto">
      <ProductForm product={product} />
    </FormPage>
  );
}

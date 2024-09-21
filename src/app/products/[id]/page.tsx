import PageTitle from "@/components/common/page-title";
import ProductForm from "@/components/products/product-form";
import db from "@/libs/db";
import { notFound } from "next/navigation";
import React from "react";

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps) {
  const productId = parseInt(params.id);

  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) return notFound();
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Agregar Producto</PageTitle>
      <ProductForm product={product} />
    </section>
  );
}

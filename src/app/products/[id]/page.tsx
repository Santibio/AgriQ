import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import { notFound } from "next/navigation";
import React from "react";
import ProductForm from "../components/product-form";

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
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Editar Producto</PageTitle>
      <ProductForm product={product} />
    </section>
  );
}

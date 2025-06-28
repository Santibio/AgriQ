import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import { notFound } from "next/navigation";
import React from "react";
import ProductionForm from "../components/production-form";

interface ProductionEditPageProps {
  params: {
    id: string;
  };
}

export default async function ProductionEditPage({
  params,
}: ProductionEditPageProps) {
  const batchId = parseInt(params.id);

  const batch = await db.batch.findUnique({
    where: { id: batchId },
  });
  
  const products = await db.product.findMany();

  if (!batch) return notFound();
  
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Editar Lote</PageTitle>
      <ProductionForm products={products} batch={batch} />
    </section>
  );
}

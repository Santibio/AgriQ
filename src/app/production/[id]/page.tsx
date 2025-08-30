import db from "@/libs/db";
import { notFound } from "next/navigation";
import React from "react";
import ProductionForm from "../components/production-form";
import FormPage from "@/components/layout/form-page";

interface ProductionEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductionEditPage(
  props: ProductionEditPageProps
) {
  const params = await props.params;
  const batchId = parseInt(params.id);

  const batch = await db.batch.findUnique({
    where: { id: batchId },
  });

  const products = await db.product.findMany();

  if (!batch) return notFound();

  const hasMovement = Boolean(
    batch.marketQuantity ||
      batch.sentQuantity ||
      batch.discardedQuantity ||
      batch.receivedQuantity ||
      batch.soltQuantity ||
      batch.reservedQuantity
  );

  return (
    <FormPage title={hasMovement ? "Detalle Lote" : "Editar Lote"}>
      <ProductionForm
        products={products}
        batch={batch}
        canEdit={!hasMovement}
      />
    </FormPage>
  );
}

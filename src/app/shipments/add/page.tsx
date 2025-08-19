import PageTitle from "@/components/page-title";
import React from "react";
import ShipmentForm from "../components/shipment-form";
import db from "@/libs/db";

export default async function ShipmentAddPage() {
  const batchs = await db.batch.findMany({
    include: {
      product: true,
    },
    where: {
      depositQuantity: {
        gt: 0,
      },
    },
  });

  return (
    <section className="flex flex-col justify-between gap-6 px-6">
      <PageTitle>Crear Envío</PageTitle>
      <ShipmentForm batchs={batchs} />
    </section>
  );
}

import React from "react";
import ShipmentForm from "../components/shipment-form";
import db from "@/lib/db";
import FormPage from "@/components/layout/form-page";

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
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });

  return (
    <FormPage title="Crear Envío">
      <ShipmentForm batchs={batchs} />
    </FormPage>
  );
}

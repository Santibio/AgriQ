import PageTitle from "@/components/page-title";
import React from "react";
import ShipmentForm from "../components/shipment-form";
import db from "@/libs/db";

export default async function ShipmentAddPage() {
  const groupedProductions = await db.production.groupBy({
    by: ["productId"],
    _sum: {
      remainingQuantity: true,
    },
  });

  const productIds = groupedProductions.map((group) => group.productId);

  const products = await db.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const groupedProductQuantities = groupedProductions.map((group) => ({
    productId: group.productId || 0,
    remainingQuantity: group._sum.remainingQuantity || 0,
  }));

  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Crear Envío</PageTitle>
      <ShipmentForm
        products={products}
        groupedProductQuantities={groupedProductQuantities}
      />
    </section>
  );
}

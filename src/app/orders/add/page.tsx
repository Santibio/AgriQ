import React from "react";
import OrderForm from "../components/order-form";
import db from "@/lib/db";
import FormPage from "@/components/layout/form-page";

export default async function ShipmentAddPage() {

  const customers = await db.customer.findMany();

  // TODO: Mejorar query
  const batchs = await db.batch.groupBy({
    by: ["productId"],
    where: {
      marketQuantity: {
        gt: 0,
      },
    },
    _sum: {
      marketQuantity: true,
    },
  })

  const productIds = batchs.map(b => b.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, image: true },
  });

  const groupBatchByProduct = batchs.map(b => ({
    productId: b.productId,
    productName: products.find(p => p.id === b.productId)?.name || "",
    quantity: b._sum.marketQuantity || 0,
    price: products.find(p => p.id === b.productId)?.price || 0,
    image: products.find(p => p.id === b.productId)?.image || "",
  }));

  return (
    <FormPage title="Crear Pedido">
      <OrderForm products={groupBatchByProduct} customers={customers}/>
    </FormPage>
  );
}

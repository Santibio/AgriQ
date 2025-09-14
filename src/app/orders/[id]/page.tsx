import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import OrderForm from "../components/order-form";
import { notFound } from "next/navigation";
import { StatusPayment } from "@prisma/client";

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentEditPage({
  params,
}: ShipmentEditPageProps) {
  // Espera params antes de usar sus propiedades
  const awaitedParams = await params;
  const orderId = parseInt(awaitedParams.id);

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      movement: {
        include: {
          movementDetail: {
            include: {
              batch: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return notFound();

  const customers = await db.customer.findMany();


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
    select: { id: true, name: true, price: true },
  });

  const groupBatchByProduct = batchs.map(b => ({
    productId: b.productId,
    productName: products.find(p => p.id === b.productId)?.name || "",
    quantity: b._sum.marketQuantity || 0,
    price: products.find(p => p.id === b.productId)?.price || "",
  }));

  const canEdit = order.statusPayment !== StatusPayment.PAID;

  const initialData = {
    customerId: order?.customerId || undefined,
    products: Object.values(
      order?.movement.movementDetail.reduce((acc, detail) => {
        const productId = detail.batch.productId;
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            productName: detail.batch.product.name,
            quantity: 0,
            price: detail.batch.product.price,
          };
        }
        acc[productId].quantity += detail.quantity;
        return acc;
      }, {} as Record<number, { productId: number; productName: string; quantity: number; price: number }>)
    ),
  };

  return (
    <section className="pt-6 flex flex-col justify-between gap-6 px-6">
      <PageTitle>
        {canEdit ? `Editar pedido #${orderId}` : `Envío #${orderId}`}
      </PageTitle>
      <OrderForm
        batchs={groupBatchByProduct}
        movementId={order?.movementId}
        canEdit={canEdit}
        customers={customers}
        initialData={initialData}
      />
    </section>
  );
}

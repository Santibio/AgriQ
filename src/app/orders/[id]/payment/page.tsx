import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import PaymentOrderForm from "../../components/payment-order-form";
import { notFound } from "next/navigation";

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentOrderPAge({
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
      customer: true,
    },
  });

  if (!order) return notFound();


  const parsedOrder = {
    id: order.id,
    customer: order?.customer,
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
        Cobro de Pedido #{order.id}
      </PageTitle>
      <PaymentOrderForm
        order={parsedOrder}
      />
    </section>
  );
}

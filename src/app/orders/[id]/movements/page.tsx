import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import PaymentOrderForm from "../../components/payment-order-form";
import { notFound } from "next/navigation";
import OrderMovements from "../../components/order-movements";

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function MovementsOrderPage({
  params,
}: ShipmentEditPageProps) {
  // Espera params antes de usar sus propiedades
  const awaitedParams = await params;
  const orderId = parseInt(awaitedParams.id);

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      movements: {
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


  return (
    <section className="flex flex-col justify-between gap-6 px-6">
      <PageTitle>
        Movimientos del Pedido #{order.id}
      </PageTitle>
     <OrderMovements order={order} />
    </section>
  );
}

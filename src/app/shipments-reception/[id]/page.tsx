import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import ShipmentsReceptionForm from "../components/shipments-reception-form";
import { notFound } from "next/navigation";

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentEditPage({
  params,
}: ShipmentEditPageProps) {
  // Espera params antes de usar sus propiedades
  const awaitedParams = await params;
  const shipmentId = parseInt(awaitedParams.id);

  const filteredShipments = await db.shipment.findUnique({
    where: { id: shipmentId, status: "PENDING" },
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
  
  if (!filteredShipments) return notFound();

  return (
    <section className="pt-6 flex flex-col justify-between gap-6 px-6">
      <PageTitle>Registrar recepción de Envío #{shipmentId}</PageTitle>
      <ShipmentsReceptionForm
        batchs={
          filteredShipments?.movement.movementDetail.map((md) => md.batch) || []
        }
        shipmentId={shipmentId}
      />
    </section>
  );
}

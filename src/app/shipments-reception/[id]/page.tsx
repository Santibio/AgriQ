import db from "@/libs/db";
import ShipmentsReceptionForm from "../components/shipments-reception-form";
import { notFound } from "next/navigation";
import FormPage from "@/components/layout/form-page";

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
    <FormPage title="Registrar recepción de Envío">
      <ShipmentsReceptionForm
        batchs={
          filteredShipments?.movement.movementDetail.map((md) => md.batch) || []
        }
        shipmentId={shipmentId}
      />
    </FormPage>
  );
}

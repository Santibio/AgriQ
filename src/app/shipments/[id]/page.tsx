import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import CustomerForm from "../components/shipment-form";
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

  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
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
  if (!shipment) return notFound();

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

  // Unifica los batchs a editar con los nuevos, sin repetir
  const batchsToEdit = shipment!.movement.movementDetail.map((detail) => ({
    ...detail.batch,
    sentQuantity: detail.quantity,
  }));

  const allBatchs = [
    ...batchsToEdit.map((batch) => ({ ...batch })),
    ...batchs
      .filter(
        (batch) =>
          !batchsToEdit.some((editedBatch) => editedBatch.id === batch.id)
      )
      .map((batch) => ({ ...batch, filtered: true })),
  ];

  const canEdit = shipment?.status === "PENDING";

  return (
    <section className="pt-6 flex flex-col justify-between gap-6 px-6">
      <PageTitle>
        {canEdit ? `Editar envío #${shipmentId}` : `Envío #${shipmentId}`}
      </PageTitle>
      <CustomerForm
        batchs={allBatchs}
        movementId={shipment?.movementId}
        canEdit={canEdit}
      />
    </section>
  );
}

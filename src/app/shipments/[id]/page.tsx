import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import CustomerForm from "../components/shipment-form";

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentEditPage({
  params,
}: ShipmentEditPageProps) {
  // Espera params antes de usar sus propiedades
  const awaitedParams = await params;
  const movementId = parseInt(awaitedParams.id);

  const filteredMovement = await db.movement.findUnique({
    where: { id: movementId },
    include: {
      shipment: {
        where: { status: "PENDING" },
      },
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
  });

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
  const batchsToEdit = filteredMovement!.movementDetail.map((detail) => ({
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

  const canEdit = filteredMovement!.shipment?.status === "PENDING";

  return (
    <section className="pt-6 flex flex-col justify-between gap-6 px-6">
      <PageTitle>
        {canEdit ? `Editar envío #${movementId}` : `Envío #${movementId}`}
      </PageTitle>
      <CustomerForm
        batchs={allBatchs}
        movementId={movementId}
        canEdit={canEdit}
      />
    </section>
  );
}

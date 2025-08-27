import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/list-page";
import db from "@/libs/db";
import ShipmentsList from "./components/shipments-list";
import paths from "@/libs/paths";

export default async function Shipments() {
  const filteredMovements = await db.movement.findMany({
    where: {
      type: "SENT",
    },
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
      shipment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <PageSection
      title="Envíos"
      actions={<AddButton href={paths.shipmentAdd()}>Crear envío</AddButton>}
    >
      <ShipmentsList filteredMovements={filteredMovements} />
    </PageSection>
  );
}

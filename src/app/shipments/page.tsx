import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";
import db from "@/libs/db";
import ShipmentsList from "./components/shipments-list";
import paths from "@/libs/paths";

export default async function Shipments() {
  const pendingShipments = await db.shipment.findMany({
    where: { status: "PENDING" }, // TODO: deberian venir todos
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <PageSection
      title="Envíos"
      actions={<AddButton href={paths.shipmentAdd()}>Crear envío</AddButton>}
    >
      <ShipmentsList list={pendingShipments} />
    </PageSection>
  );
}

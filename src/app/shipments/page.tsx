import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import ShipmentsList from "./components/shipments-list";

import AddButton from "@/components/buttons/add-button";
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
    <section className="flex flex-col justify-between gap-6 px-6">
      <PageTitle>Envíos</PageTitle>
      <ShipmentsList filteredMovements={filteredMovements} />
      <AddButton href={paths.shipmentAdd()}>Crear envío</AddButton>
    </section>
  );
}

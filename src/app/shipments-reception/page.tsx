import PageSection from "@/components/layout/list-page";
import db from "@/libs/db";
import ShipmentsReceptionList from "./components/shipments-reception-list";

export default async function Shipments() {
  const filteredMovements = await db.shipment.findMany({
    where: {
      status: "PENDING",
    },
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
    <PageSection title="Recepción de envíos">
      <ShipmentsReceptionList list={filteredMovements} />
    </PageSection>
  );
}

import ListPage from "@/components/layout/list-page";
import db from "@/lib/db";
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
    <ListPage title="Recepción de envíos">
      <ShipmentsReceptionList list={filteredMovements} />
    </ListPage>
  );
}

import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";
import db from "@/lib/db";
import ShipmentsList from "./components/shipments-list";
import paths from "@/lib/paths";

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
            // Pre-sort details to get the first product alphabetically
            orderBy: {
              batch: {
                product: {
                  name: "asc",
                },
              },
            },
          },
        },
      },
    },
    // The primary DB sort is by date, we'll re-sort in memory by product name
    orderBy: {
      createdAt: "desc",
    },
  });

  // Sort the shipments in-memory by the first product's name
  pendingShipments.sort((a, b) => {
    const productAName = a.movement?.movementDetail[0]?.batch.product.name;
    const productBName = b.movement?.movementDetail[0]?.batch.product.name;

    if (!productAName) return 1; // Shipments without products go to the end
    if (!productBName) return -1;

    return productAName.localeCompare(productBName);
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

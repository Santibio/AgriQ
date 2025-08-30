import db from "@/libs/db";
import DiscardList from "./components/discard-list";
import paths from "@/libs/paths";
import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";

export default async function Shipments() {
  const filteredMovements = await db.movement.findMany({
    where: {
      type: "DISCARDED",
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
      discard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <PageSection
      title="Descartes"
      actions={<AddButton href={paths.discardAdd()}>Crear descarte</AddButton>}
    >
      <DiscardList filteredMovements={filteredMovements} />
    </PageSection>
  );
}

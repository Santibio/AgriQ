import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import DiscardList from "./components/discard-list";
import paths from "@/libs/paths";
import AddButton from "@/components/buttons/add-button";

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
    <section className="flex flex-col justify-between gap-6 px-6">
      <PageTitle>Descarte</PageTitle>
      <DiscardList filteredMovements={filteredMovements} />
      <AddButton href={paths.discardAdd()}>Crear descarte</AddButton>
    </section>
  );
}

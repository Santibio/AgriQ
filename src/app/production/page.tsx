import db from "@/libs/db";
import ProductionsList from "./components/productions-list";
import paths from "@/libs/paths";
import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/list-page";

export default async function ProductionPage() {
  const productions = await db.batch.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <PageSection
      title="Producción"
      actions={<AddButton href={paths.productionAdd()}>Crear lote</AddButton>}
    >
      <ProductionsList productions={productions} />
    </PageSection>
  );
}

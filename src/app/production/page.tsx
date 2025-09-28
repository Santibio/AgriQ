import db from "@/lib/db";
import ProductionsList from "./components/productions-list";
import paths from "@/lib/paths";
import AddButton from "@/components/buttons/add-button";
import ListPage from "@/components/layout/list-page";

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
    <ListPage
      title="Producción"
      actions={<AddButton href={paths.productionAdd()}>Crear lote</AddButton>}
    >
      <ProductionsList productions={productions} />
    </ListPage>
  );
}

import db from "@/lib/db";
import paths from "@/lib/paths";
import ProductsList from "@/app/products/components/products-list";
import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";

export default async function ProductsPage() {

  const products = await db.product.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <PageSection
      title="Productos"
      actions={<AddButton href={paths.productAdd()}>Crear producto</AddButton>}
    >
      <ProductsList products={products} />
    </PageSection>
  );
}

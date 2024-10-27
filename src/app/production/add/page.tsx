import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import ProductionForm from "../components/production-form";

export default async function ProductionPage() {
  const products = await db.product.findMany();
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Crear Producción</PageTitle>
      <ProductionForm products={products} />
    </section>
  );
}

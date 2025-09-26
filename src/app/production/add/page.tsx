import db from "@/lib/db";
import ProductionForm from "../components/production-form";
import FormPage from "@/components/layout/form-page";

export default async function ProductionPage() {
  const products = await db.product.findMany({
    where: {
      active: true
    }
  });

  return (
    <FormPage title="Crear Lote">
      <ProductionForm products={products} />
    </FormPage>
  );
}

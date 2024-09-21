import db from "@/libs/db";
import { Plus } from "lucide-react";
import { Button, Link } from "@nextui-org/react";
import PageTitle from "@/components/page-title";
import paths from "@/libs/paths";
import ProductsList from "@/app/products/components/products-list";

export default async function ProductsPage() {
  const products = await db.product.findMany();
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Productos</PageTitle>
      <ProductsList products={products} />
      <Button
        color="primary"
        className="w-full"
        href={paths.productAdd()}
        as={Link}
        startContent={<Plus className="h-[20px]" />}
      >
        Agregar producto
      </Button>
    </section>
  );
}

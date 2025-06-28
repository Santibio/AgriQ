import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import ProductionsList from "./components/productions-list";
import paths from "@/libs/paths";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@heroui/react";

export default async function ProductionPage() {
  const productions = await db.batch.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Producción</PageTitle>
      <ProductionsList productions={productions} />
      <Button
        color="primary"
        className="w-full"
        href={paths.productionAdd()}
        as={Link}
        startContent={<Plus className="h-[20px]" />}
      >
        Agregar lote
      </Button>
    </section>
  );
}

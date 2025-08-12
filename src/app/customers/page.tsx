import db from "@/libs/db";
import { Plus } from "lucide-react";
import { Button, Link } from "@nextui-org/react";
import PageTitle from "@/components/page-title";
import paths from "@/libs/paths";
import CustomerList from "./components/customers-list";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: [
      { active: "desc" },
      { lastName: "asc" },
    ],
  });

  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Lista de clientes</PageTitle>

      <CustomerList customers={customers} />

      <Button
        color="primary"
        className="w-full"
        href={paths.customerAdd()}
        as={Link}
        startContent={<Plus className="h-[20px]" />}
      >
        Agregar cliente
      </Button>
    </section>
  );
}

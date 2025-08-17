import PageTitle from "@/components/page-title";
import db from "@/libs/db";
import { notFound } from "next/navigation";
import CustomerForm from "../components/customer-form";

interface CustomerEditPageProps {
  params: {
    id: string;
  };
}

export default async function CustomerEditPage({
  params,
}: CustomerEditPageProps) {
  // Espera params antes de usar sus propiedades
  const awaitedParams = await params;
  const customerId = parseInt(awaitedParams.id);

  const customer = await db.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) return notFound();

  return (
    <section className="pt-6 flex flex-col justify-between gap-6">
      <PageTitle>Editar Cliente</PageTitle>
      <CustomerForm customer={customer} />
    </section>
  );
}

import db from "@/lib/db";
import { notFound } from "next/navigation";
import CustomerForm from "../components/customer-form";
import FormPage from "@/components/layout/form-page";

interface CustomerEditPageProps {
  params: Promise<{ id: string }>;
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
    <FormPage title="Editar Cliente">
      <CustomerForm customer={customer} />
    </FormPage>
  );
}

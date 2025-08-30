import db from "@/libs/db";
import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";
import paths from "@/libs/paths";
import CustomerList from "./components/customers-list";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: [{ active: "desc" }, { lastName: "asc" }],
  });

  return (
    <PageSection
      title="Clientes"
      actions={<AddButton href={paths.customerAdd()}>Crear cliente</AddButton>}
    >
      <CustomerList customers={customers} />
    </PageSection>
  );
}

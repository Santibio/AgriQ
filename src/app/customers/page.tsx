import db from "@/lib/db";
import AddButton from "@/components/buttons/add-button";
import ListPage from "@/components/layout/list-page";
import paths from "@/lib/paths";
import CustomerList from "./components/customers-list";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: [{ active: "desc" }, { lastName: "asc" }],
  });

  return (
    <ListPage
      title="Clientes"
      actions={<AddButton href={paths.customerAdd()}>Crear cliente</AddButton>}
    >
      <CustomerList customers={customers} />
    </ListPage>
  );
}

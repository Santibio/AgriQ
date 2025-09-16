import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";
import db from "@/libs/db";
import Orderslist from "./components/orders-list";
import paths from "@/libs/paths";

export default async function Orders() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const currentOrders = await db.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      movements: {
        include: {
          movementDetail: {
            include: {
              batch: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <PageSection
      title="Pedidos"
      actions={<AddButton href={paths.orderAdd()}>Crear pedido</AddButton>}
    >
      <Orderslist list={currentOrders} />
    </PageSection>
  );
}

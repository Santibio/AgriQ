import { Order } from "@prisma/client";

interface OrderMovementsProps {
  order: Order;
}

export default function OrderMovements({ order }: OrderMovementsProps   ) {

  console.log("🚀 ~ OrderMovements ~ order:", order)
  return <div>Order Movements</div>;
}
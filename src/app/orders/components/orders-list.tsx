import { Chip, Link } from "@heroui/react";

import { CalendarArrowUp, CheckCheck, CircleX } from "lucide-react";
import moment from "moment";
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Order,
} from "@prisma/client";
import paths from "@/libs/paths";
import { JSX } from "react";
import { capitalize } from "@/libs/utils";
import EmptyListMsg from "@/components/empty-list";

interface OrderListProps {
  list: shipmentWithRelations[];
}

type shipmentWithRelations = Order & {
  movement: Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product;
      };
    })[];
  };
};

const STATUS_MAP: Record<
  Order["statusDoing"],
  { icon: JSX.Element; gradient: string }
> = {
  PENDING: {
    icon: <CalendarArrowUp className="h-6 w-6 text-white" />,
    gradient: "from-success to-success/50",
  },
  READY_TO_DELIVER: {
    icon: <CheckCheck className="h-6 w-6 text-white" />,
    gradient: "from-primary to-primary/50",
  },
  DELIVERED: {
    icon: <CircleX className="h-6 w-6 text-white" />,
    gradient: "from-red-400 to-red-600",
  },
};

export default function OrderList({ list }: OrderListProps) {
  if (!list || list.length === 0)
    return <EmptyListMsg text="No hay envíos pendientes" />;
  return (
    <ul className="flex gap-2 flex-col">
      {list.map((order) => (
        <li key={order.id}>
          <Link
            href={paths.orderToEdit(order.id.toString())}
            className="flex border rounded-md p-2 gap-2"
          >
            <div
              className={`w-12 h-12 rounded-md bg-gradient-to-r ${STATUS_MAP?.[order?.statusDoing].gradient
                } flex items-center justify-center `}
            >
              {STATUS_MAP[order.statusDoing].icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xl">{`Envio #${order.id}`}</span>
                  <span className="text-slate-500 text-sm">
                    {moment(order?.createdAt).fromNow()}
                  </span>
                </div>
                <div className="flex gap-2 items-center text-sm flex-wrap mt-2">
                  {order.movement.movementDetail.map((product) => (
                    <Chip key={product.id} size="sm">
                      {capitalize(product.batch.product.name)} x
                      {product.quantity}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

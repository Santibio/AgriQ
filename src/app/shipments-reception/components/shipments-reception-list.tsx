import { Chip, Link } from "@heroui/react";

import { CalendarArrowUp, CheckCheck, CircleX } from "lucide-react";
import moment from "moment";
import {
  Batch,
  Movement,
  MovementDetail,
  Product,
  Shipment,
} from "@prisma/client";
import paths from "@/libs/paths";
import { JSX } from "react";
import EmptyListMsg from "@/components/empty-list";
import { capitalize } from "@/libs/utils";

interface ShipmentsListProps {
  list: shipmentWithRelations[];
}

type shipmentWithRelations = Shipment & {
  movement: Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product;
      };
    })[];
  };
};

const STATUS_MAP: Record<
  Shipment["status"],
  { icon: JSX.Element; gradient: string }
> = {
  PENDING: {
    icon: <CalendarArrowUp className="h-6 w-6 text-white" />,
    gradient: "from-success to-success/50",
  },
  RECEIVED_OK: {
    icon: <CheckCheck className="h-6 w-6 text-white" />,
    gradient: "from-primary to-primary/50",
  },
  RECEIVED_NO_OK: {
    icon: <CircleX className="h-6 w-6 text-white" />,
    gradient: "from-error to-error/50",
  },
};

export default function ShipmentsList({ list }: ShipmentsListProps) {
  if (!list || list.length === 0)
    return <EmptyListMsg text="No hay envíos para recibir" />;

  return (
    <ul className="flex gap-2 flex-col">
      {list.map((shipment) => (
        <li key={shipment.id}>
          <Link
            href={paths.shipmentReceptionEdit(shipment.id.toString())}
            className="flex border rounded-md p-2 gap-2"
          >
            <div
              className={`w-12 h-12 rounded-md bg-gradient-to-r ${
                STATUS_MAP?.[shipment?.status || "PENDING"].gradient
              } flex items-center justify-center `}
            >
              {STATUS_MAP[shipment!.status].icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xl">{`Envio #${shipment.id}`}</span>
                  <span className="text-slate-500 text-sm">
                    {moment(shipment?.createdAt).fromNow()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center text-sm flex-wrap mt-2">
                  {shipment.movement.movementDetail.map((product) => (
                    <Chip key={product.id} size="sm">
                      {capitalize(product.batch.product.name)} x
                      {product.quantity}
                    </Chip>
                  ))}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

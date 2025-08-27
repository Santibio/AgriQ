import { Link, ScrollShadow } from "@heroui/react";

import { CalendarArrowUp, CheckCheck, CircleX } from "lucide-react";
import moment from "moment";
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Shipment,
} from "@prisma/client";
import paths from "@/libs/paths";
import { JSX } from "react";

interface ShipmentsListProps {
  filteredMovements: MovementWithRelations[];
}

type MovementWithRelations = Movement & {
  movementDetail: (MovementDetail & {
    batch: Batch & {
      product: Product;
    };
  })[];
  shipment: Shipment | null;
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

export default function ShipmentsList({
  filteredMovements,
}: ShipmentsListProps) {
  return (
      <ul className="flex gap-2 flex-col">
        {filteredMovements.map((movement) => (
          <li key={movement.id}>
            <Link
              href={paths.shipmentEdit(movement.id.toString())}
              className="flex border rounded-md p-2 gap-2"
            >
              <div
                className={`w-12 h-12 rounded-md bg-gradient-to-r ${
                  STATUS_MAP?.[movement?.shipment?.status || "PENDING"].gradient
                } flex items-center justify-center `}
              >
                {STATUS_MAP[movement!.shipment!.status].icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xl">{`Envio #${movement.id}`}</span>
                    <span className="text-slate-500 text-sm">
                      {moment(movement?.createdAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center text-sm flex-wrap">
                    {movement.movementDetail?.map((product) => (
                      <span
                        className="bg-slate-200 rounded-lg px-2 text-slate-400"
                        key={product.id}
                      >
                        {product.batch.product.name}
                      </span>
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

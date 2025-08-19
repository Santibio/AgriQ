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

const STATUS_MAP: Record<string, React.ReactNode> = {
  PENDING: <CalendarArrowUp className="h-[20px] w-[20px] text-success" />,
  RECEIVED_OK: <CheckCheck className="h-[20px] w-[20px] text-primary" />,
  RECEIVED_NO_OK: <CircleX className="h-[20px] w-[20px] text-error" />,
};

export default function ShipmentsList({
  filteredMovements,
}: ShipmentsListProps) {
  return (
    <ScrollShadow className="h-[70dvh]">
      <ul className="flex gap-2 flex-col">
        {filteredMovements.map((movement) => (
          <li key={movement.id}>
            <div className="flex border rounded-md p-2 gap-2">
              <div className="mt-2">
                  {STATUS_MAP[movement!.shipment!.status] }
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
              <div>
              </div>
                {movement?.shipment?.status === "PENDING" && (
                  <Link href={paths.shipmentEdit(movement.id.toString())}>
                    Editar
                  </Link>
                )}
            </div>
          </li>
        ))}
      </ul>
    </ScrollShadow>
  );
}

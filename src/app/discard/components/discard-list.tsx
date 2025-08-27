import { Chip, ScrollShadow } from "@heroui/react";

import { CircleX, FishOff, ShieldAlert } from "lucide-react";
import moment from "moment";
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Discard,
} from "@prisma/client";
import { JSX } from "react";
import { capitalize } from "@/libs/utils";

interface DiscardListProps {
  filteredMovements: MovementWithRelations[];
}

type MovementWithRelations = Movement & {
  movementDetail: (MovementDetail & {
    batch: Batch & {
      product: Product;
    };
  })[];
  discard: Discard | null;
};
const REASON_MAP: Record<
  Discard["reason"],
  { icon: JSX.Element; background: string; label: string }
> = {
  EXPIRED: {
    icon: <FishOff className="h-6 w-6 text-green-600" />,
    background: "bg-green-100",
    label: "Vencido",
  },
  DAMAGED: {
    icon: <ShieldAlert className="h-6 w-6 text-red-600" />,
    background: "bg-red-100",
    label: "Dañado",
  },
  OTHER: {
    icon: <CircleX className="h-6 w-6 text-gray600" />,
    background: "bg-gray-100",
    label: "Otro",
  },
};

export default function DiscardList({ filteredMovements }: DiscardListProps) {
  return (
      <ul className="flex gap-2 flex-col">
        {filteredMovements.map((movement) => (
          <li
            key={movement.id}
            className="flex border rounded-xl p-4 gap-4 bg-white shadow hover:shadow-lg transition-all"
          >
            {movement.discard && (
              <div
                className={`w-10 h-10 rounded-md ${
                  REASON_MAP?.[movement.discard.reason].background
                } flex items-center justify-center`}
              >
                {REASON_MAP[movement.discard.reason].icon}
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-xl text-gray-800">
                  {capitalize(movement.movementDetail[0].batch.product.name)}
                </span>
                <span className="text-slate-500 text-sm">
                  {moment(movement?.createdAt).fromNow()}
                </span>
              </div>
              {movement.discard && (
                <div className="flex gap-4 items-center mt-1 justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Motivo:
                    </span>
                    <Chip size="sm">
                      {REASON_MAP?.[movement.discard.reason].label}
                    </Chip>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Cantidad:
                    </span>
                    <Chip size="sm" color="primary" radius="sm" variant="flat">
                      {movement.movementDetail[0].quantity}
                    </Chip>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
  );
}

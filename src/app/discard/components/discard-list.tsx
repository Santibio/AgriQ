import { Chip, ScrollShadow } from "@heroui/react";

import { CalendarArrowUp, CheckCheck, CircleX } from "lucide-react";
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
  { icon: JSX.Element; gradient: string }
> = {
  EXPIRED: {
    icon: <CalendarArrowUp className="h-6 w-6 text-white" />,
    gradient: "from-success to-success/50",
  },
  DAMAGED: {
    icon: <CheckCheck className="h-6 w-6 text-white" />,
    gradient: "from-primary to-primary/50",
  },
  OTHER: {
    icon: <CircleX className="h-6 w-6 text-white" />,
    gradient: "from-error to-error/50",
  },
};

export default function DiscardList({ filteredMovements }: DiscardListProps) {
  return (
    <ScrollShadow className="h-[70dvh]">
      <ul className="flex gap-2 flex-col">
        {filteredMovements.map((movement) => (
          <li key={movement.id} className="flex border rounded-md p-2 gap-2">
            {movement.discard && (
              <div
                className={`w-12 h-12 rounded-md bg-gradient-to-r ${
                  REASON_MAP?.[movement.discard.reason].gradient
                } flex items-center justify-center `}
              >
                {REASON_MAP[movement.discard.reason].icon}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xl">{`Descarte #${movement.id}`}</span>
                  <span className="text-slate-500 text-sm">
                    {moment(movement?.createdAt).fromNow()}
                  </span>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {movement.movementDetail?.map((product) => (
                    <Chip key={product.id} size="sm" color="default" variant="flat">
                      {capitalize(product.batch.product.name)}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ScrollShadow>
  );
}


import { ScrollShadow } from "@nextui-org/react";
import {
  Shipment,
  User,
  ShipmentProduction,
  Product,
  Production,
} from "@prisma/client";
import { CheckCheck } from "lucide-react";
import moment from "moment";
import "moment/locale/es"; 

moment.locale("es");

interface ShipmentsListProps {
  shipments: ShipmentWithRelations[];
}

type ShipmentWithRelations = Shipment & {
  user: User; 
  shipments: (ShipmentProduction & {
    production: Production & {
      product: Product;
    };
  })[];
};

export default function ShipmentsList({ shipments }: ShipmentsListProps) {
  console.log("shipments: ", shipments);

  return (
    <ScrollShadow className="h-[70dvh]">
      <ul className="flex gap-2 flex-col">
        {shipments.map((shipment) => (
          <li key={shipment.id}>
            <div className="flex border rounded-md p-2 gap-2">
              <div className="mt-2">
                <div className="flex items-center bg-primary-50 rounded-md p-2">
                  <CheckCheck className="h-[20px] w-[20px] text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xl">{`Envio #${shipment.id}`}</span>
                    <span className="text-slate-500 text-sm">
                      {moment(shipment?.createdAt).startOf("hour").fromNow()}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center text-sm flex-wrap">
                    {shipment?.shipments?.map((product) => (
                      <span
                        className="bg-slate-200 rounded-lg px-2 text-slate-400"
                        key={product.id}
                      >
                        {product.production.product.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ScrollShadow>
  );
}

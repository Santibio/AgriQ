import { Product, Production } from "@prisma/client";
import { ScrollShadow } from "@nextui-org/react";
import moment from "moment";
import Image from "next/image";
import { capitalize } from "@/libs/helpers/text";

interface ProductionsListProps {
  productions: ProductionWithRelations[];
}

type ProductionWithRelations = Production & {
  product: Product;
};

export default function ProductionsList({ productions }: ProductionsListProps) {
  return (
    <ScrollShadow className="h-[70dvh] pb-1 custom-scroll-shadow" hideScrollBar>
      <ul className="flex gap-2 flex-col">
        {productions.map((production) => (
          <li key={production.id}>
            <div className="flex border rounded-md p-2 gap-2">
              <Image
                src={production.product.image}
                alt={production.product.name}
                width={60}
                height={60}
                className="object-cover rounded-md"
              />
              <div className="flex-1">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xl">{`Lote #${production.id}`}</span>
                    <span className="text-slate-500 text-sm">
                      {moment(production?.createdAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-between items-center">
                    <span
                      className="rounded-lg  text-slate-400 font-semibold"
                      key={production.productId}
                    >
                      {capitalize(production.product.name)}
                    </span>
                    <span
                      className="rounded-lg  text-slate-400 font-bold text-sm"
                      key={production.productId}
                    >
                      x{production.quantity}
                    </span>
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

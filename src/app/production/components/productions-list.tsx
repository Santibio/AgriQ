import { Product, Batch } from "@prisma/client";
import { Image } from "@heroui/react";
import moment from "moment";
import { capitalize } from "@/lib/helpers/text";
import EmptyListMsg from "@/components/empty-list";
import Link from "next/link";
import paths from "@/lib/paths";

interface ProductionsListProps {
  productions: ProductionWithRelations[];
}

type ProductionWithRelations = Batch & {
  product: Product;
};

export default function ProductionsList({ productions }: ProductionsListProps) {
  return (
    <ul className="flex gap-2 flex-col">
      {productions.length ? (
        productions.map((production) => (
          <li key={production.id}>

            <Link
              key={production.id}
              href={paths.productionEdit(production.id.toString())}
              className=" w-full"
            >
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
                      >
                        {capitalize(production.product.name)}
                      </span>
                      <span
                        className="rounded-lg  text-slate-400 font-bold text-sm"
                      >
                        x{production.initialQuantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))
      ) : (
        <EmptyListMsg text="No hay lotes disponibles." />
      )}
    </ul>
  );
}

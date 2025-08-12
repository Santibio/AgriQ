import type { Customer } from "@prisma/client";
import { Avatar, ScrollShadow } from "@nextui-org/react";
import Link from "next/link";
import paths from "@/libs/paths";
import clsx from "clsx";

interface CustomerListProps {
  customers: Customer[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  return (
    <ScrollShadow className="h-[70dvh]">
      <ul className="flex gap-2 flex-col">
        {customers?.map((c) => (
          <li key={c.id}>
            <div
              className={clsx(
                "flex border rounded-md p-1 gap-2 items-center justify-between",
                !c.active && "opacity-50"
              )}
            >
              {c.active ? (
                <Link href={paths.customerEdit(c.id.toString())} className="w-full">
                  <CustomerInfo customer={c} />
                </Link>
              ) : (
                <div className="w-full">
                  <CustomerInfo customer={c} />
                </div>
              )}
              {/* Si tienes un menú de acciones reutilizable, colócalo aquí */}
            </div>
          </li>
        ))}
      </ul>
    </ScrollShadow>
  );
}

function CustomerInfo({ customer }: { customer: Customer }) {
  return (
    <div className="flex gap-4 items-center">
      <Avatar src={undefined} showFallback />
      <div className="flex flex-col">
        <h3 className="text-md text-primary font-medium capitalize">
          {`${customer.lastName} ${customer.name}`}
        </h3>
        <p className="text-slate-500">
          {customer.email || "---"} {customer.phone ? `• ${customer.phone}` : ""}
        </p>
      </div>
    </div>
  );
}
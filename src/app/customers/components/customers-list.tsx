import type { Customer } from "@prisma/client";
import { Avatar } from "@nextui-org/react";
import Link from "next/link";
import paths from "@/libs/paths";
import clsx from "clsx";
import { File, Mail, Phone } from "lucide-react";

interface CustomerListProps {
  customers: Customer[];
}

interface CustomerInfoProps {
  customer: Customer;
}

const AVATAR_COLOR_MAP: Record<
  Customer["fiscalCondition"],
  "primary" | "secondary" | "success" | "warning"
> = {
  RESPONSIBLE: "primary",
  MONOTAX: "secondary",
  FINAL_CONSUMER: "success",
  EXEMPT: "warning",
};

const CustomerInfo = ({ customer }: CustomerInfoProps) => {
  return (
    <div className="flex gap-3 items-center px-3 py-2">
      <Avatar
        name={`${customer.lastName} ${customer.name}`}
        size="sm"
        className={`bg-${
          AVATAR_COLOR_MAP[customer.fiscalCondition]
        } text-white`}
        radius="sm"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-primary capitalize">
          {`${customer.lastName} ${customer.name}`}
        </span>
        <div className="flex gap-3 text-xs text-slate-500">
          {customer.email && (
            <span className="flex items-center gap-1">
              <Mail size={16} />
              {customer.email}
            </span>
          )}
          {customer.phone && (
            <span className="flex items-center gap-1">
              <Phone size={16} />
              {customer.phone}
            </span>
          )}
          {customer.fiscalCondition && (
            <span className="flex items-center gap-1 text-xs">
              <File size={16} />
              CUIT/CUIL: {customer.fiscalCondition}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CustomerList({ customers }: CustomerListProps) {
  return (
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
                <Link
                  href={paths.customerEdit(c.id.toString())}
                  className="w-full"
                >
                  <CustomerInfo customer={c} />
                </Link>
              ) : (
                <div className="w-full">
                  <CustomerInfo customer={c} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
  );
}

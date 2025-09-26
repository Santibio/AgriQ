import type { Customer } from "@prisma/client";
import { Avatar, Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import Link from "next/link";
import paths from "@/lib/paths";
import { Mail, Phone } from "lucide-react";

interface CustomerListProps {
  customers: Customer[];
}

// --- Mapeo de colores para el Avatar y los Chips ---
const CUSTOMER_STYLES: Record<
  Customer["fiscalCondition"],
  { color: "primary" | "secondary" | "success" | "warning"; label: string }
> = {
  RESPONSIBLE: { color: "primary", label: "Responsable Inscripto" },
  MONOTAX: { color: "secondary", label: "Monotributista" },
  FINAL_CONSUMER: { color: "success", label: "Consumidor Final" },
  EXEMPT: { color: "warning", label: "Exento" },
};

// --- Componente de la Tarjeta de Cliente con NextUI ---
const CustomerCard = ({ customer }: { customer: Customer }) => {
  const { color: fiscalColor, label: fiscalLabel } = CUSTOMER_STYLES[customer.fiscalCondition];
  const isInactive = !customer.active;

  const cardContent = (
    <Card 
      className={`${isInactive ? "opacity-60" : ""} border-1`}
      fullWidth
      shadow="none"
    >
      <CardHeader className="flex justify-between items-start gap-2">
        <div className="flex gap-3 items-center">
          <Avatar
            name={`${customer.lastName} ${customer.name}`}
            size="md"
            color={fiscalColor}
            className="flex-shrink-0"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold text-foreground capitalize text-start">
              {`${customer.lastName} ${customer.name}`}
            </h3>
            <Chip 
              size="sm" 
              variant="flat" 
              color={fiscalColor}
              className="mt-1"
            >
              {fiscalLabel}
            </Chip>
          </div>
        </div>
        {isInactive && (
          <Chip size="sm" color="danger" variant="flat">
            Inactivo
          </Chip>
        )}
      </CardHeader>
      <CardBody className="pt-0">
        <div className="flex gap-4">
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-foreground-500">
              <Mail size={16} className="text-default-400" />
              <span className="truncate">{customer.email.toLowerCase()}</span>
            </div>
          )}
          {customer.phone && <div className="text-slate-300">|</div>}
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-foreground-500">
              <Phone size={16} className="text-default-400" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );

  if (isInactive) {
    return <div className="mb-3">{cardContent}</div>;
  }

  return (
    <Link 
      href={paths.customerEdit(customer.id.toString())}
      className="block mb-3"
    >
      {cardContent}
    </Link>
  );
};

// --- Componente Principal de la Lista ---
export default function CustomerList({ customers }: CustomerListProps) {
  if (!customers?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-foreground-500">
        <p>No hay clientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}

import React, { JSX } from 'react';
import { Card, CardBody } from "@heroui/react";
import { capitalize } from "@/libs/utils";
import { Order, Movement, MovementDetail, Batch, Product, Customer, MovementType } from "@prisma/client";
import { DollarSign, PackageCheck, ShoppingCart, Truck, XCircle } from "lucide-react";

// Extiende los tipos para incluir las relaciones
type MovementWithDetails = Movement & {
  movementDetail: (MovementDetail & {
    batch: Batch & {
      product: Product;
    };
  })[];
};

type OrderWithMovements = Order & {
  movements: MovementWithDetails[];
  customer: Customer;
};

interface OrderMovementsProps {
  order: OrderWithMovements;
}

const movementTypeMap: Partial<Record<MovementType, { icon: JSX.Element; label: string; color: string; }>> = {
  [MovementType.ORDERED]: {
    icon: <ShoppingCart className="h-5 w-5 text-white" />,
    label: "Pedido Creado",
    color: "blue"
  },
  [MovementType.READY_TO_DELIVER]: {
    icon: <PackageCheck className="h-5 w-5 text-white" />,
    label: "Listo para Entregar",
    color: "yellow"
  },
  [MovementType.DELIVERED]: {
    icon: <Truck className="h-5 w-5 text-white" />,
    label: "Entregado",
    color: "green"
  },
  [MovementType.DISCARDED]: {
    icon: <XCircle className="h-5 w-5 text-white" />,
    label: "Descartado",
    color: "red"
  },
  [MovementType.SOLD]: {
    icon: <DollarSign className="h-5 w-5 text-white" />,
    label: "Cobrado",
    color: "gray"
  },
};

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  gray: 'bg-gray-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export default function OrderMovements({ order }: OrderMovementsProps) {

  const sortedMovements = [...order.movements]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .filter(movement => movementTypeMap[movement.type]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 pb-20">
      <div className="relative">
        <ul className="space-y-0">
          {sortedMovements.map((movement, index) => {
            const movementInfo = movementTypeMap[movement.type]!;
            const isLast = index === sortedMovements.length - 1;

            return (
              <li key={movement.id} className="relative flex items-start">
                <div className="flex flex-col items-center mr-5">
                  <span className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${colorClasses[movementInfo.color]}`}>
                    {movementInfo.icon}
                  </span>
                  {!isLast && (
                    <div className={`w-0.5 h-24 ${colorClasses[movementInfo.color]}`}></div>
                  )}
                </div>
                <div className="pt-1.5">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg mt-[-8px]">{movementInfo.label}</h3>
                  </div>
                  <time className="text-sm text-gray-500 mt-1">
                    {new Date(movement.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' a las ' + new Date(movement.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </time>

                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  );
}
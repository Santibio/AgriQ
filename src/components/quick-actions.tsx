import { Card, CardBody } from "@heroui/react";
import {
  BarChart3,
  CircleUser,
  DollarSign,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import paths from "@/libs/paths";

const quickActions = [
  {
    title: "Producción",
    description: "Gestión de la producción",
    icon: Package,
    color: "bg-green-500",
    gradient: "from-green-400 to-green-600",
    link: paths.production(),
  },
  {
    title: "Ventas",
    description: "Administración de ventas",
    icon: DollarSign,
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    title: "Envíos",
    description: "Seguimiento de envíos",
    icon: Truck,
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
    link: paths.shipments(),
  },
  {
    title: "Reportes",
    description: "Informes y análisis",
    icon: BarChart3,
    color: "bg-orange-500",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    title: "Clientes",
    description: "Gestión de clientes",
    icon: CircleUser,
    color: "bg-teal-500",
    gradient: "from-teal-400 to-teal-600",
    link: paths.customers(),
  },
];

const QuickActions = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <Link href={action.link || "#"} key={index}>
            <Card
              key={index}
              className="bg-white/70 backdrop-blur-sm border-white/20 "
            >
              <CardBody className="p-4">
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center `}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

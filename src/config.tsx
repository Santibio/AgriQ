import { ReactNode } from "react";
/* import {
  CalendarCheck,
  CalendarCheck2,
  CircleDollarSign,
  ClipboardMinus,
  Leaf,
  ScanBarcode,
  Trash,
  Truck,
  Undo2,
  UserCog,
} from "lucide-react"; */
import { BarChart3, Home, Package, Settings, TrendingUp } from "lucide-react";

import { Role as PrismaRole } from "@prisma/client";

// Definir la interfaz para los elementos de navegación
/* interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: ReactNode;
  description: string;
} */
interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  link: string; // Href opcional para enlaces de navegación
}

// Definir la interfaz para los permisos por rol
interface RolePermissions {
  ADMIN: string[];
  DEPOSIT: string[];
  SELLER: string[];
}

// Definir la interfaz para los roles
interface Role {
  id: string;
  label: string;
}

interface FiscalInformation {
  id: string;
  label: string;
}

interface DiscardReason {
  id: string;
  label: string;
}

// Definir la interfaz para el objeto de configuración
interface Config {
  navItems: NavItem[];
  roles: Role[];
  rolePermissions: RolePermissions;
  ficalInformation: FiscalInformation[];
  conditionsToDiscard: DiscardReason[];
}

const config: Config = {
  navItems: [
    {
      id: "home",
      icon: <Home className="w-5 h-5" />,
      label: "Inicio",
      link: "/",
    },
    {
      id: "production",
      icon: <Package className="w-5 h-5" />,
      label: "Producción",
      link: "/production",
    },
    {
      id: "orders",
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Pedidos",
      link: "/orders",
    },

    {
      id: "reports",
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Reportes",
      link: "/reports",
    },
    {
      id: "settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Ajustes",
      link: "/settings",
    },
  ],
  roles: [
    { id: PrismaRole.ADMIN, label: "Administrador" },
    { id: PrismaRole.DEPOSIT, label: "Depósito" },
    { id: PrismaRole.SELLER, label: "Ventas" },
  ],
  rolePermissions: {
    [PrismaRole.ADMIN]: [
      "production",
      "discards",
      "shipments",
      "returns-reception",
      "sales",
      "shipment-reception",
      "return",
      "reports",
      "users",
      "products",
    ],
    [PrismaRole.DEPOSIT]: [
      "production",
      "discards",
      "shipments",
      "returns-reception",
      "reports",
    ],
    [PrismaRole.SELLER]: ["sales", "shipment-reception", "return", "reports"],
  },
  ficalInformation: [
    { id: "RESPONSIBLE", label: "Responsable" },
    { id: "MONOTAX", label: "Monotributista" },
    { id: "FINAL_CONSUMER", label: "Consumidor Final" },
    { id: "EXEMPT", label: "Exento" },
  ],
  conditionsToDiscard: [
    { id: "EXPIRED", label: "Vencido" },
    { id: "DAMAGED", label: "Dañado" },
    { id: "OTHER", label: "Otro" },
  ],
};

export default config;

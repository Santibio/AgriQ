import { ReactNode } from "react";
import {
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
} from "lucide-react";
import { Role as PrismaRole } from "@prisma/client";


// Definir la interfaz para los elementos de navegación
interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: ReactNode;
  description: string;
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

// Definir la interfaz para el objeto de configuración
interface Config {
  navItems: NavItem[];
  roles: Role[];
  rolePermissions: RolePermissions;
}

const config: Config = {
  navItems: [
    {
      id: "production",
      name: "Producción",
      href: "/production",
      icon: <Leaf className="stroke-primary" />,
      description: "Gestión de la producción de productos",
    },
    {
      id: "discards",
      name: "Descartes",
      href: "/discards",
      icon: <Trash className="stroke-primary" />,
      description: "Control de productos descartados",
    },
    {
      id: "shipments",
      name: "Envíos",
      href: "/shipments",
      icon: <Truck className="stroke-primary" />,
      description: "Seguimiento y gestión de envíos",
    },
    {
      id: "returns-reception",
      name: "Recepción Devoluciones",
      href: "/returns-reception",
      icon: <CalendarCheck className="stroke-primary" />,
      description: "Recepción y manejo de devoluciones",
    },
    {
      id: "sales",
      name: "Ventas",
      href: "/sales",
      icon: <CircleDollarSign className="stroke-primary" />,
      description: "Administración de ventas y facturación",
    },
    {
      id: "shipment-reception",
      name: "Recepción Envíos",
      href: "/shipment-reception",
      icon: <CalendarCheck2 className="stroke-primary" />,
      description: "Recepción de envíos de productos",
    },
    {
      id: "return",
      name: "Devoluciones",
      href: "/returns",
      icon: <Undo2 className="stroke-primary" />,
      description: "Gestión de productos devueltos",
    },
    {
      id: "reports",
      name: "Reportes",
      href: "/reports",
      icon: <ClipboardMinus className="stroke-primary" />,
      description: "Generación de informes y reportes",
    },
    {
      id: "users",
      name: "Usuarios",
      href: "/users",
      icon: <UserCog className="stroke-primary" />,
      description: "Administración de usuarios y permisos",
    },
    {
      id: "products",
      name: "Productos",
      href: "/products",
      icon: <ScanBarcode className="stroke-primary" />,
      description: "Gestión de inventario de productos",
    },
    {
      id: "customers",
      name: "Clientes",
      href: "/customers",
      icon: <UserCog className="stroke-primary" />,
      description: "Gestión de clientes",
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
      "customers",
    ],
    [PrismaRole.DEPOSIT]: [
      "production",
      "discards",
      "shipments",
      "returns-reception",
      "reports",
    ],
    [PrismaRole.SELLER]: ["sales", "shipment-reception", "return", "reports", "customers"],
  },
};

export default config;

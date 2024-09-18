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

// Definir la interfaz para los elementos de navegación
interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  description: string;
}

// Definir la interfaz para el objeto de configuración
interface Config {
  navItems: NavItem[];
}

const config: Config = {
  navItems: [
    {
      name: "Producción",
      href: "/production",
      icon: <Leaf className="stroke-primary"/>,
      description: "Gestión de la producción de productos",
    },
    {
      name: "Descartes",
      href: "/discards",
      icon: <Trash className="stroke-primary"/>,
      description: "Control de productos descartados",
    },
    {
      name: "Envios",
      href: "/shipments",
      icon: <Truck className="stroke-primary"/>,
      description: "Seguimiento y gestión de envíos",
    },
    {
      name: "Recepción Devoluciones",
      href: "/returns-reception",
      icon: <CalendarCheck className="stroke-primary"/>,
      description: "Recepción y manejo de devoluciones",
    },
    {
      name: "Ventas",
      href: "/sales",
      icon: <CircleDollarSign className="stroke-primary"/>,
      description: "Administración de ventas y facturación",
    },
    {
      name: "Recepción Enviós",
      href: "/shipment-reception",
      icon: <CalendarCheck2 className="stroke-primary"/>,
      description: "Recepción de envíos de productos",
    },
    {
      name: "Devoluciones",
      href: "/returns",
      icon: <Undo2 className="stroke-primary"/>,
      description: "Gestión de productos devueltos",
    },
    {
      name: "Reportes",
      href: "/reports",
      icon: <ClipboardMinus className="stroke-primary"/>,
      description: "Generación de informes y reportes",
    },
    {
      name: "Usuarios",
      href: "/users",
      icon: <UserCog className="stroke-primary"/>,
      description: "Administración de usuarios y permisos",
    },
    {
      name: "Producto",
      href: "/products",
      icon: <ScanBarcode className="stroke-primary"/>,
      description: "Gestión de inventario de productos",
    },
  ],
};

export default config;

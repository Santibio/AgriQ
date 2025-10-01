import { ReactNode } from "react";
import { BarChart3, Home, Package, Settings, TrendingUp } from "lucide-react";

import { Role as PrismaRole } from "@prisma/client";

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  link: string;
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

interface Presentation {
  id: string;
  label: string;
  cod: number;
}

interface ProductType {
  id: string;
  label: string;
  cod: number;
  color: string;
  presentation: Presentation[];
}

interface ProductCategory {
  id: string;
  label: string;
  cod: number;
  type: ProductType[];
}

// Definir la interfaz para el objeto de configuración
interface Config {
  navItems: NavItem[];
  roles: Role[];
  rolePermissions: RolePermissions;
  fiscalInformation: FiscalInformation[];
  conditionsToDiscard: DiscardReason[];
  productCategories: ProductCategory[];
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
  fiscalInformation: [
    { id: "RESPONSIBLE", label: "Responsable Inscripto" },
    { id: "MONOTAX", label: "Monotributista" },
    { id: "FINAL_CONSUMER", label: "Consumidor Final" },
    { id: "EXEMPT", label: "Exento" },
  ],
  conditionsToDiscard: [
    { id: "EXPIRED", label: "Vencido" },
    { id: "DAMAGED", label: "Dañado" },
    { id: "OTHER", label: "Otro" },
  ],
  productCategories: [
    {
      id: "aromaticas", label: "Aromaticas", cod: 1, type:
        [
          {
            id: "secas", label: "Secas", cod: 1, color: "default", presentation: [
              {
                id: "paquete",
                label: "Paquete",
                cod: 1,
              }
            ]
          },
          {
            id: "frescas", label: "Frescas", cod: 2, color: "success", presentation:
              [
                {
                  id: "paquete",
                  label: "Paquete",
                  cod: 1
                },
                {
                  id: "plantin",
                  label: "Plantin",
                  cod: 2
                }
              ]
          },
        ]
    },
    {
      id: "hortalizas", label: "Hortalizas", cod: 2, type:
        [
          {
            id: "deHoja", label: "De Hoja", cod: 1, color: "secondary", presentation: [
              {
                id: "paquete",
                label: "Paquete",
                cod: 1
              }
            ]
          },
          {
            id: "tuberculosRaices", label: "Tuberculos y Raices", cod: 2, color: "danger", presentation:
              [
                {
                  id: "paquete",
                  label: "Paquete",
                  cod: 1
                },

              ]
          },
          {
            id: "varios", label: "Varios", cod: 3, color: "warning", presentation:
              [
                {
                  id: "paquete",
                  label: "Paquete",
                  cod: 1
                },

                {
                  id: "plantin",
                  label: "Plantin",
                  cod: 2
                },
              ]
          },
        ]
    },

  ]
};

export default config;

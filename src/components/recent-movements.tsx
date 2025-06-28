import { Button, Card, CardBody } from "@heroui/react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";

const recentMovements = [
  {
    id: 1,
    type: "production",
    title: "Cosecha de Tomates",
    description: "Lote A-123 • 500kg",
    time: "Hace 2 horas",
    status: "completed",
    icon: Package,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "shipment",
    title: "Envío a Mercado Central",
    description: "Pedido #MC-456 • 300kg",
    time: "Hace 4 horas",
    status: "in-transit",
    icon: Truck,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "sale",
    title: "Venta Directa",
    description: "Cliente: Restaurante El Campo",
    time: "Hace 6 horas",
    status: "completed",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    id: 4,
    type: "return",
    title: "Devolución Procesada",
    description: "Lote B-789 • 50kg",
    time: "Ayer",
    status: "warning",
    icon: RotateCcw,
    color: "text-orange-600",
  },
];

interface MovementStats {
  [key: string]: {
    color: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
}

const movementStatusMap: MovementStats = {
  completed: {
    color: "bg-green-500 text-white",
    icon: CheckCircle,
  },
  warning: {
    color: "bg-red-500 text-white",
    icon: AlertCircle,
  },
  "in-transit": {
    color: "bg-slate-100",
    icon: Clock,
  },
};

const RecentMovements = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Movimientos Recientes
        </h3>
        <Button variant="light" size="sm" color="primary">
          Ver todos
        </Button>
      </div>
      <div className="space-y-3">
        {recentMovements.map((movement) => (
          <Card
            key={movement.id}
            className="bg-white/70 backdrop-blur-sm border-white/20"
          >
            <CardBody className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    movement.status === "completed"
                      ? "bg-green-100"
                      : movement.status === "warning"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                  }`}
                >
                  <movement.icon className={`h-5 w-5 ${movement.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {movement.title}
                    </h4>
                    <Button
                      size="sm"
                      className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        movementStatusMap[movement.status].color
                      } `}
                      disabled
                    >
                      {movement.status === "completed" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : movement.status === "warning" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {movement.status === "completed"
                        ? "Completado"
                        : movement.status === "warning"
                        ? "Atención"
                        : "En proceso"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {movement.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{movement.time}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentMovements;

"use client"
import { Card, Chip, Drawer, DrawerBody, DrawerContent, DrawerHeader, Listbox, ListboxItem, useDisclosure } from "@heroui/react";

import { CheckCheck, DollarSign, Edit, Eye, PackageCheck, PackageOpen, Trash } from "lucide-react";
import moment from "moment";
import {
  Movement,
  MovementDetail,
  Batch,
  Product,
  Order,
  StatusDoing,
  StatusPayment,
} from "@prisma/client";
import { JSX, useState } from "react";
import { capitalize } from "@/libs/utils";
import EmptyListMsg from "@/components/empty-list";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";
import { setOrderStatusToCancel, setOrderStatusToDelivered, setOrderStatusToReady } from "../actions";
import { toast } from "sonner";

interface OrderListProps {
  list: shipmentWithRelations[];
}

type shipmentWithRelations = Order & {
  movements: (Movement & {
    movementDetail: (MovementDetail & {
      batch: Batch & {
        product: Product;
      };
    })[];
  })[];
};


const STATUS_MAP: Record<
  Order["statusDoing"],
  { icon: JSX.Element; gradient: string; label: string }
> = {
  PENDING: {
    icon: <PackageOpen className="h-6 w-6 text-white" />,
    gradient: "from-warning to-warning/50",
    label: "Pendiente"
  },
  READY_TO_DELIVER: {
    icon: <PackageCheck className="h-6 w-6 text-white" />,
    gradient: "from-primary to-primary/50",
    label: "Preparado"
  },
  DELIVERED: {
    icon: <CheckCheck className="h-6 w-6 text-white" />,
    gradient: "from-success to-success/50",
    label: "Entregado"
  },
};

const getAvailableActions = (order: Order, router: ReturnType<typeof useRouter>, handlers: { handleStatusDoing: () => void, handleStatusPedingToDeliver: () => void, handleStatusPedingToCancel: () => void }) => {
  const actions = [
    {
      key: 'view_movements',
      label: 'Ver movimientos del pedido',
      icon: <Eye />,
      onPress: () => router.push(paths.orderToMovements(order.id.toString())),
      isVisible: true,
    },
    {
      key: 'edit',
      label: 'Editar pedido',
      icon: <Edit />,
      onPress: () => router.push(paths.orderToEdit(order.id.toString())),
      isVisible: order?.statusPayment === StatusPayment.UNPAID,
    },
    {
      key: 'charge',
      label: 'Cobrar pedido',
      icon: <DollarSign />,
      onPress: () => router.push(paths.orderToCharge(order.id.toString())),
      isVisible: order?.statusPayment === StatusPayment.UNPAID,
    },
    {
      key: 'prepare',
      label: 'Preparar pedido',
      icon: <PackageOpen />,
      onPress: handlers.handleStatusDoing,
      isVisible: order?.statusDoing === StatusDoing.PENDING && order.statusPayment !== StatusPayment.CANCELED,
    },
    {
      key: 'deliver',
      label: 'Entregar pedido',
      icon: <PackageOpen />,
      onPress: handlers.handleStatusPedingToDeliver,
      isVisible: order?.statusDoing === StatusDoing.READY_TO_DELIVER && order?.statusPayment === StatusPayment.PAID,
    },
    
    {
      key: 'cancel',
      label: <span className="text-red-500">Cancelar pedido</span>,
      icon: <Trash className="text-red-500" />,
      onPress: handlers.handleStatusPedingToCancel,
      isVisible: order?.statusDoing !== StatusDoing.DELIVERED && order?.statusPayment !== StatusPayment.CANCELED,
    },
  ];

  return actions.filter(action => action.isVisible);
};

export default function OrderList({ list }: OrderListProps) {
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)


  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleStatusDoing = async () => {
    try {
      const response = await setOrderStatusToReady(selectedOrder!.id)

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Pedido preparada correctamente");

    } catch (error) {
      console.error("Error: ", error);
      toast.error(
        "Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe."
      );
    } finally {
      onOpenChange();
    }
  }
  const handleStatusPedingToDeliver = async () => {
    try {
      const response = await setOrderStatusToDelivered(selectedOrder!.id)

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Pedido entregada correctamente");

    } catch (error) {
      console.error("Error: ", error);
      toast.error(
        "Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe."
      );
    } finally {
      onOpenChange();
    }
  }

  const handleStatusPedingToCancel = async () => {
    try {
      const response = await setOrderStatusToCancel(selectedOrder!.id)

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Pedido cancelada correctamente");

    } catch (error) {
      console.error("Error: ", error);
      toast.error(
        "Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe."
      );
    } finally {
      onOpenChange();
    }
  }

  if (!list || list.length === 0)
    return <EmptyListMsg text="No hay envíos pendientes" />;

  return (
    <>
      <ul className="flex gap-2 flex-col  w-full">
        {list.map((order) => (
          <li key={order.id}>
            <Card
              isPressable
              onPress={() => handleSelectOrder(order)}
              className="w-full p-4 border"
              shadow="none"
            >
              <div className="flex gap-4 items-start">
                {/* Icono con fondo gradiente */}
                <div
                  className={`w-14 h-14 min-w-[3.5rem] rounded-lg bg-gradient-to-r ${STATUS_MAP?.[order?.statusDoing]?.gradient
                    } flex items-center justify-center text-white text-xl`}
                >
                  {STATUS_MAP[order.statusDoing]?.icon}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-lg">
                      Pedido #{order.id}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {moment(order?.createdAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span>{STATUS_MAP?.[order?.statusDoing]?.label
                    }</span>
                    <span>{order.statusPayment}</span>
                  </div>

                  {/* Productos */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {order.movements[0]?.movementDetail.map((product) => (
                      <Chip
                        key={product.id}
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="capitalize"
                      >
                        {capitalize(product.batch.product.name)} × {product.quantity}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="bottom"
        size="xl"
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">
                  Pedido #{selectedOrder?.id}
                </h2>
              </DrawerHeader>
              <DrawerBody className="pb-10 pt-2">
                <div>
                  <Listbox variant="faded">
                    {getAvailableActions(selectedOrder!, router, { handleStatusDoing, handleStatusPedingToDeliver, handleStatusPedingToCancel }).map(action => (
                      <ListboxItem key={action.key} startContent={action.icon} onPress={action.onPress}>
                        {action.label}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

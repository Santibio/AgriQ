"use client";

import { Customer } from "@prisma/client";
import { Input } from "@heroui/react";
import { capitalize } from "@/libs/helpers/text";
import { confirmOrder } from "../actions";
import { Listbox, ListboxItem } from "@heroui/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";
import FormWrapper from "@/components/layout/form-wrapper";
import { convertToArgentinePeso } from "@/libs/helpers/number";

interface ProductionFormProps {
  order: {
    id: number;
    customer: Customer;
    products: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }
}

export default function PaymentOrderForm({
  order
}: ProductionFormProps) {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    try {
      const response = await confirmOrder(order.id);

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Orden creada correctamente");
      router.push(paths.orders());
    } catch (error) {
      console.error("Error al crear la orden:", error);
      toast.error("Ocurrió un error al procesar la solicitud.");
    }
  }

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      buttonLabel="Confirmar"
      showScrollShadow={false}
    >
      <div className="flex flex-col gap-6 w-full">
        <Input
          readOnly
          label="Cliente"
          defaultValue={order?.customer.name + " " + order?.customer.lastName}
        />
        {order.products.length > 0 && (
          <div>
            <div className="mt-4">
              <Listbox aria-label="Productos agregados" className="w-full">
                {order.products.map((product) => (
                  <ListboxItem key={product.productId} className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">{capitalize(product.productName)}</span>
                      <span className="text-xs text-default-600">Cantidad: {product.quantity}</span>
                      <span className="text-xs text-default-600">Precio: {convertToArgentinePeso(product.price)}</span>
                      <span className="text-xs text-default-600">Subtotal: {convertToArgentinePeso(product.price * product.quantity)}</span>
                    </div>

                  </ListboxItem>
                ))}
              </Listbox>
            </div>
            <div>
              <span className="text-lg font-semibold">Total: ${order.products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </FormWrapper>
  );
}

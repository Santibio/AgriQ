"use client";

import { Batch, Product } from "@prisma/client";
import { useState } from "react";
import { Checkbox, Input, Card } from "@heroui/react";
import { createShipment, editShipment } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";
import { capitalize } from "@/libs/utils";

type ShipmentFormProps = {
  batchs: (Batch & { product: Product; filtered?: boolean })[];
  movementId?: number; // Agregado para manejar el modo de edición
};

const quantityToCheck = (
  batch: Batch & {
    product: Product;
    depositQuantity?: number;
    sentQuantity?: number;
  },
  isEditing: boolean
) => {
  if (isEditing) {
    return batch.sentQuantity;
  }
  return batch.depositQuantity;
};

export default function ShipmentForm({
  batchs,
  movementId,
}: ShipmentFormProps) {
  const isEditing = Boolean(movementId);

  const router = useRouter();

  // Estado para lotes seleccionados y cantidades
  const [selected, setSelected] = useState<{ [batchId: number]: boolean }>(() =>
    Object.fromEntries(batchs.map((b) => [b.id, !b.filtered]))
  );

  const [quantities, setQuantities] = useState<{ [batchId: number]: number }>(
    () =>
      Object.fromEntries(
        batchs.map((b) => [b.id, quantityToCheck(b, isEditing)])
      )
  );

  const [initialQuantities] = useState<{ [batchId: number]: number }>(() =>
    Object.fromEntries(batchs.map((b) => [b.id, quantityToCheck(b, isEditing)]))
  );

  const handleSelect = (batchId: number) => {
    setSelected((prev) => ({ ...prev, [batchId]: !prev[batchId] }));
  };

  const handleQuantityChange = (batchId: number, value: string) => {
    const num = Number(value);
    setQuantities((prev) => ({ ...prev, [batchId]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBatches = batchs.filter((b) => selected[b.id]);
    const formData = selectedBatches.map((b) => ({
      batchId: b.id,
      quantity: quantities[b.id] || 0,
    }));

    try {
      const response = isEditing
        ? await editShipment(Number(movementId), formData)
        : await createShipment(formData);

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Envio generado correctamente");
      router.push(paths.shipments());
    } catch (error) {
      console.error("Error al enviar los lotes:", error);
      toast.error("Ocurrió un error al procesar la solicitud.");
    }
  };

  const hasError =
    batchs.some(
      (batch) =>
        selected[batch.id] &&
        (quantities[batch.id] === undefined ||
          quantities[batch.id] < 1 ||
          quantities[batch.id] >
            (isEditing
              ? batch.sentQuantity + batch.depositQuantity
              : batch.depositQuantity))
    ) || !batchs.some((batch) => selected[batch.id]);

  const depositQuantity = (
    batch: Batch & {
      product: Product;
      depositQuantity?: number;
      sentQuantity?: number;
    }
  ) =>
    isEditing
      ? initialQuantities[batch.id] +
          batch.depositQuantity -
          quantities[batch.id] <
        0
        ? 0
        : initialQuantities[batch.id] +
          batch.depositQuantity -
          quantities[batch.id]
      : batch.depositQuantity - (quantities[batch.id] || 0);

  return (
    <form onSubmit={handleSubmit} >
      <div className="flex flex-col gap-6">
        {batchs.map((batch) => (
          <Card
            key={batch.id}
            className="p-6 flex flex-col gap-3 border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                isSelected={!!selected[batch.id]}
                onChange={() => handleSelect(batch.id)}
                aria-label={`Seleccionar lote ${batch.id}`}
                className="scale-110"
              >
                <span className="font-semibold text-lg text-gray-800">
                  {batch.product.name}
                </span>
              </Checkbox>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Lote #{batch.id}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-600">En depósito quedara:</span>
              <span className="font-bold text-primary text-lg bg-primary-50 px-2 py-1 rounded">
                {batch.depositQuantity}
              </span>
              <Input
                type="number"
                min={0}
                max={batch.depositQuantity}
                value={
                  quantities[batch.id] !== undefined
                    ? String(quantities[batch.id])
                    : ""
                }
                onChange={(e) => handleQuantityChange(batch.id, e.target.value)}
                label="Cantidad a enviar"
                placeholder="0"
                size="sm"
                isDisabled={!selected[batch.id]}
                className=" ml-2"
              />
            </div>
          </Card>
        ))}
      </div>
    </form>
  );
}

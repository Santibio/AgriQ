"use client";
import { Product, Batch } from "@prisma/client";
import {
  Image,
  Card,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import moment from "moment";
import { capitalize } from "@/libs/helpers/text";
import EmptyListMsg from "@/components/empty-list";
import { Sheet } from "react-modal-sheet";
import { useState } from "react";
import config from "@/config";
import { createDiscard } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";

interface DiscardListProps {
  batchs: ProductionWithRelations[];
}

type ProductionWithRelations = Batch & {
  product: Product;
};

export default function DiscardList({ batchs }: DiscardListProps) {
  const [isOpen, setOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch>();
  const [discardForm, setDiscardForm] = useState({
    reason: "",
    productToDescard: "",
  });
  const router = useRouter();

  console.log("discardForm: ", discardForm);
  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDiscardForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBatchSelect = (batch: Batch) => {
    setSelectedBatch(batch);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("reason", discardForm.reason);
    formData.append("productToDescard", discardForm.productToDescard);

    const response = await createDiscard(selectedBatch!.id, formData);

    if (response?.errors) {
      return toast.error("Ocurrió un error al procesar la solicitud.");
    }

    toast.success("Producto descartado correctamente");

    router.push(paths.discard());
    setOpen(false);
    setSelectedBatch(undefined);
    setDiscardForm({ reason: "", productToDescard: "" });
  };

  return (
    <>
      <ul className="flex gap-2 flex-col">
        {batchs.length ? (
          batchs.map((batch) => (
            <Card
              key={batch.id}
              className="flex border rounded-md p-2 gap-2"
              onPress={() => handleBatchSelect(batch)}
              isPressable
            >
              <Image
                src={batch.product.image}
                alt={batch.product.name}
                width={60}
                height={60}
                className="object-cover rounded-md"
              />
              <div className="flex-1">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xl">{`Lote #${batch.id}`}</span>
                    <span className="text-slate-500 text-sm">
                      {moment(batch?.createdAt).fromNow()}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-between items-center">
                    <span
                      className="rounded-lg  text-slate-400 font-semibold"
                      key={batch.productId}
                    >
                      {capitalize(batch.product.name)}
                    </span>
                    <span
                      className="rounded-lg  text-slate-400 font-bold text-sm"
                      key={batch.productId}
                    >
                      x{batch.depositQuantity}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyListMsg text="No hay lotes disponibles." />
        )}
      </ul>
      <Sheet isOpen={isOpen} onClose={() => setOpen(false)}>
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold">
                Descartar productos del Lote #{selectedBatch?.id}
              </h2>
              <p className="text-gray-600">
                Selecciona la cantidad de productos que deseas descartar.
              </p>
              <Input
                type="number"
                min={0}
                max={selectedBatch?.depositQuantity}
                label="Cantidad a descartar"
                value={
                  Number(discardForm.productToDescard) !== 0
                    ? String(discardForm.productToDescard)
                    : ""
                }
                name="productToDescard"
                required
                onChange={handleOnchange}
                placeholder="Cantidad"
              />
              <Select
                label="Razón del descarte"
                onChange={handleOnchange}
                name="reason"
              >
                {config.conditionsToDiscard.map((condition) => (
                  <SelectItem key={condition.id}>{condition.label}</SelectItem>
                ))}
              </Select>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Confirmar Descarte
              </button>
            </form>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </>
  );
}

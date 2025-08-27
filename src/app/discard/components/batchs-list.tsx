"use client";
import { Product, Batch } from "@prisma/client";
import {
  Button,
  Image,
  Card,
  Input,
  Select,
  SelectItem,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
  Form,
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
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedBatch, setSelectedBatch] = useState<Batch>();
  const [discardForm, setDiscardForm] = useState({
    reason: "",
    productToDescard: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setDiscardForm({ reason: "", productToDescard: "" });
  };

  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDiscardForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBatchSelect = (batch: Batch) => {
    setSelectedBatch(batch);
    resetForm();
    onOpen();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("reason", discardForm.reason);
    formData.append("productToDescard", discardForm.productToDescard);

    try {
      const response = await createDiscard(selectedBatch!.id, formData);

      if (response?.errors) {
        return toast.error("Ocurrió un error al procesar la solicitud.");
      }

      toast.success("Producto descartado correctamente");

      router.push(paths.discard());
      setSelectedBatch(undefined);
      setDiscardForm({ reason: "", productToDescard: "" });
    } catch (error) {
      return toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      onClose();
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ul className="flex gap-2 flex-col">
        {batchs.length ? (
          batchs.map((batch) => (
            <Card
              key={batch.id}
              className="flex border rounded-md p-2 gap-2 flex-row items-center cursor-pointer hover:bg-gray-50"
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
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="bottom"
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">
                  Descartar productos del Lote #{selectedBatch?.id}
                </h2>
                <p className="text-gray-600 text-sm">
                  Selecciona la cantidad de productos que deseas descartar.
                </p>
              </DrawerHeader>
              <DrawerBody className="pb-10 pt-2">
                <Form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-4 w-full">
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
                        <SelectItem key={condition.id}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <Button
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Confirmar
                  </Button>
                </Form>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

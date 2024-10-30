"use client";

import { useForm, Controller } from "react-hook-form";
import { Product } from "@prisma/client";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import { capitalize } from "@/libs/helpers/text";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Trash } from "lucide-react";
import {
  AddProductionInputs,
  CreateProductionFormSchema,
} from "@/libs/schemas/production";
// import { createProduction } from "../actions";
import { useState } from "react";
import { createShipment } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";

interface GroupedProductQuantity {
  productId: number; // o string, dependiendo de cómo manejes el tipo de ID
  remainingQuantity: number;
}

interface ProductionFormProps {
  products: Product[];
  groupedProductQuantities: GroupedProductQuantity[];
}

interface AddedProduct {
  id: number | undefined;
  product: string;
  quantity: number;
}

// Esquema de validación Zod

export default function ShipmentForm({
  products,
  groupedProductQuantities,
}: ProductionFormProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<AddProductionInputs>({
    resolver: zodResolver(CreateProductionFormSchema),
    defaultValues: {
      product: "",
      quantity: undefined,
    },
  });

  const [availableProducts, setAvailableProducts] =
    useState<Product[]>(products);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<
    string | number | null
  >(""); // Estado local para manejar el valor del Autocomplete

  const addProduct = (data: AddProductionInputs) => {
    const productQuantity = groupedProductQuantities.find(
      (group) => group.productId === Number(data.product)
    );

    if (productQuantity)
      if (data.quantity > productQuantity?.remainingQuantity) {
        // Verificar si la cantidad ingresada excede la cantidad disponible
        setError("quantity", {
          message: `La cantidad excede la cantidad disponible (${productQuantity?.remainingQuantity}).`,
        });
        return;
      }

    const product = products.find(
      (product) => product.id === Number(data.product)
    );

    const newAvailableProducts = availableProducts.filter(
      (product) => product.id !== Number(data.product)
    );
    setAvailableProducts(newAvailableProducts);
    setAddedProducts((prevData) => [
      ...prevData,
      { ...data, product: product?.name || "", id: product?.id },
    ]);
    reset();
    setSelectedProduct(null);
  };

  const deleteFromAddedProducts = (index: number) => {
    const productToRemove = addedProducts[index]; // Obtén el producto que se va a eliminar

    // Filtra el producto que se va a eliminar
    const newSelectedProducts = addedProducts.filter((_, i) => i !== index);

    setAddedProducts(newSelectedProducts); // Actualiza la lista de productos agregados
    // Agregar el producto de nuevo a la lista de productos disponibles
    const newAvailableProduct = products.find(
      (product) => product.name === productToRemove.product
    );

    if (newAvailableProduct) {
      setAvailableProducts((prevProducts) => [
        ...prevProducts,
        newAvailableProduct,
      ]);
    }
  };

  const handleCreateShipment = async () => {
    try {
      setIsloading(true);
      const response = await createShipment(addedProducts);
      if (response?.errors) {
        const errorMessage =
          response.errors._form?.[0] || "An unexpected error occurred.";
        toast.error(errorMessage);
      } else {
        toast.success("Envío creado correctamente");
        router.push(paths.shipments());
      }
    } catch (error) {
      console.log("Error: ", error);
      // Optionally handle unexpected errors
      toast.error("An unexpected error occurred.");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(addProduct)}>
        <div className="flex flex-col gap-4">
          <Controller
            name="product"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                label="Producto"
                placeholder="Buscar producto"
                onSelectionChange={(key) => {
                  field.onChange(key);
                  setSelectedProduct(key);
                }}
                defaultItems={availableProducts}
                isInvalid={!!errors.product}
                errorMessage={errors.product?.message}
                startContent={
                  <Search
                    className="text-default-400"
                    strokeWidth={2.5}
                    size={20}
                  />
                }
                value={selectedProduct || ""}
                selectedKey={selectedProduct}
              >
                {(item) => (
                  <AutocompleteItem key={item.id}>
                    {capitalize(item.name)}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          />
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Cantidad"
                placeholder="Ingresar cantidad"
                value={field.value?.toString() ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                isInvalid={!!errors.quantity}
                errorMessage={errors.quantity?.message}
              />
            )}
          />
          <Button
            type="submit"
            className="ml-auto"
            variant="flat"
            color="primary"
            isIconOnly
          >
            <Plus className="h-[20px]" />
          </Button>
        </div>
      </form>
      <ScrollShadow className="h-[40dvh] flex flex-col gap-2 overflow-y-auto">
        {addedProducts.length ? (
          <>
            <span className="font-semibold">Productos añadidos:</span>
            {addedProducts.map((product, index) => (
              <div
                key={product.product}
                className="flex gap-2 items-center bg-slate-200 rounded-lg p-2 justify-between"
              >
                <div className="flex gap-2 items-center">
                  <span className="font-semibold capitalize">
                    {product.product}
                  </span>
                  <span>x{product.quantity}</span>
                </div>
                <Trash
                  className="h-[20px]"
                  onClick={() => deleteFromAddedProducts(index)}
                />
              </div>
            ))}
          </>
        ) : (
          <h4 className="text-center font-semibold mt-4">
            No hay productos añadidos
          </h4>
        )}
      </ScrollShadow>
      <Button
        // type="submit"
        color="primary"
        variant="ghost"
        className="w-full mt-6"
        isLoading={isLoading}
        isDisabled={isLoading || !addedProducts.length}
        onClick={handleCreateShipment}
      >
        Confirmar
      </Button>
    </>
  );
}

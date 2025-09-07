"use client";

import { Customer } from "@prisma/client";
import { Autocomplete, AutocompleteItem, Drawer, DrawerBody, DrawerContent, DrawerHeader, Input, } from "@heroui/react";
import { capitalize } from "@/libs/helpers/text";

import { Search } from "lucide-react";

import { confirmOrder, createOrder } from "../actions";
import { Key, useState } from "react";
import { Button, Listbox, ListboxItem, useDisclosure } from "@heroui/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";
import FormWrapper from "@/components/layout/form-wrapper";
import CustomerForm from "./customer-form";

interface ProductionFormProps {
  batchs: {
    productId: number;
    productName: string;
    quantity: number;
  }[];
  canEdit?: boolean;
  customers: Customer[];
  movementId?: number;
  initialData?: {
    customerId?: number;
    products?: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }
}

export default function OrderForm({
  batchs,
  customers,
  initialData,
}: ProductionFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const { isOpen: isOpenCustomerDrawer, onOpen: onOpenCustomerDrawer, onOpenChange } = useDisclosure();

  const [orderFormData, setOrderFormData] = useState<{
    customerId: number;
    products: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }>({
    customerId: initialData?.customerId || 0,
    products: initialData?.products || [],
  });


  const [selectedProduct, setSelectedProduct] = useState<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  } | null>(null);

  const [productFormFata, setProductFormData] = useState({
    productId: "",
    quantity: 0,
  });

  const [productsList, setProductsList] = useState<Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    selectedQuantity: number;
  }>>(initialData?.products ? initialData.products.map(p => ({
    productId: p.productId,
    productName: p.productName,
    quantity: p.quantity,
    price: p.price,
    selectedQuantity: p.quantity,
  })) : []);


  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ quantity: number }>({ quantity: 0 });

  // Filtrar productos ya agregados
  const availableBatchs = batchs.filter(
    b => !productsList.some(p => p.productId === b.productId)
  );


  const handleChangeProductForm = (value: Key | null) => {
    setProductFormData({ productId: String(value), quantity: 0 });
    setSelectedProduct(availableBatchs.find(b => b.productId === Number(value)) || null);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !productFormFata.quantity || productFormFata.quantity <= 0) {
      toast.error("Selecciona un producto y cantidad válida");
      return;
    }
    setProductsList([
      ...productsList,
      {
        ...selectedProduct,
        selectedQuantity: productFormFata.quantity,
      },
    ]);
    setProductFormData({ productId: "", quantity: 0 });
    setSelectedProduct(null);
    setOrderFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          productId: selectedProduct.productId,
          productName: selectedProduct.productName,
          quantity: productFormFata.quantity,
          price: selectedProduct.price,
        },
      ],
    }));
  };

  const handleDeleteProduct = (index: number) => {
    setProductsList(productsList.filter((_, i) => i !== index));
  };

  const handleEditProduct = (index: number) => {
    setEditIndex(index);
    setEditForm({ quantity: productsList[index].selectedQuantity });
  };

  const handleSaveEdit = () => {
    if (editIndex === null) return;
    setProductsList(productsList.map((p, i) =>
      i === editIndex ? { ...p, selectedQuantity: editForm.quantity } : p
    ));
    setEditIndex(null);
    onOpenChange();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    try {
      const response = isEditing
        ? await confirmOrder(orderFormData)
        : await createOrder(orderFormData);
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
    <>
      <FormWrapper
        onSubmit={handleSubmit}
        buttonLabel="Confirmar"
        showScrollShadow={false}
      >
        <div className="flex flex-col gap-6 w-full">
          <div>
            <Autocomplete
              label="Cliente"
              placeholder="Buscar cliente"
              onSelectionChange={(value: Key | null) => setOrderFormData((prev) => ({ ...prev, customerId: value ? Number(value) : null }))}
              defaultItems={customers}
              startContent={
                <Search className="text-default-400" strokeWidth={2.5} size={20} />
              }
              value={orderFormData.customerId ? String(orderFormData.customerId) : ""}
              defaultSelectedKey={orderFormData.customerId ? String(orderFormData.customerId) : ""}
              className="w-full"
            >
              {customers.map((customer) =>
                <AutocompleteItem key={customer.id}>
                  {capitalize(`${customer.name}  ${customer.lastName}`)}
                </AutocompleteItem>
              )}
            </Autocomplete>
            <div className="flex justify-end mt-2">
              <Button onPress={onOpenCustomerDrawer} size="sm" variant="flat" color="primary">
                Agregar cliente
              </Button>
            </div>
          </div>
          <Autocomplete
            label="Producto"
            placeholder="Buscar producto"
            onSelectionChange={handleChangeProductForm}
            defaultItems={availableBatchs}
            startContent={
              <Search className="text-default-400" strokeWidth={2.5} size={20} />
            }
            value={productFormFata.productId}
            className="w-full"
          >
            {availableBatchs.map((batch) =>
              <AutocompleteItem key={batch.productId}>
                {capitalize(batch.productName)}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Input
            type="number"
            label="Cantidad"
            placeholder="Ingresar cantidad"
            description={selectedProduct ? `Cantidad disponible: ${selectedProduct.quantity}` : "Seleccione un producto"}
            disabled={!selectedProduct}
            min={0}
            max={selectedProduct?.quantity}
            value={
              Number(productFormFata.quantity) !== 0
                ? String(productFormFata.quantity)
                : ""
            }
            onChange={(e) => setProductFormData({ ...productFormFata, quantity: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex flex-col gap-2 bg-default-100 rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-default-600 font-medium">Precio unitario:</span>
              <span className="text-default-900 font-semibold">
                {selectedProduct ? `$${Number(selectedProduct.price).toFixed(2)}` : "$0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-600 font-medium">Precio total:</span>
              <span className="text-primary font-bold">
                {selectedProduct && productFormFata.quantity
                  ? `$${(Number(selectedProduct.price) * productFormFata.quantity).toFixed(2)}`
                  : "$0.00"}
              </span>
            </div>
          </div>
          <Button
            color="primary"
            className="w-full"
            onPress={handleAddProduct}
            isDisabled={!selectedProduct || !productFormFata.quantity || productFormFata.quantity <= 0}
          >
            Agregar producto
          </Button>
          {productsList.length > 0 && (
            <div>
              <div className="mt-4">
                <Listbox aria-label="Productos agregados" className="w-full">
                  {productsList.map((product, idx) => (
                    <ListboxItem key={product.productId} className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">{capitalize(product.productName)}</span>
                        <span className="text-xs text-default-600">Cantidad: {product.selectedQuantity}</span>
                        <span className="text-xs text-default-600">Precio: ${product.price}</span>
                        <span className="text-xs text-default-600">Subtotal: ${product.price * product.selectedQuantity}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" color="warning" variant="flat" onPress={() => handleEditProduct(idx)}>
                          Editar
                        </Button>
                        <Button size="sm" color="danger" variant="flat" onPress={() => handleDeleteProduct(idx)}>
                          Borrar
                        </Button>
                      </div>
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
              <div>
                <span className="text-lg font-semibold">Total: ${productsList.reduce((acc, p) => acc + (p.price * p.selectedQuantity), 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

      </FormWrapper>
      <Drawer
        isOpen={isOpenCustomerDrawer}
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
                  Agregar cliente
                </h2>
              </DrawerHeader>
              <DrawerBody className="pb-10 pt-2">
                <CustomerForm
                />

              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

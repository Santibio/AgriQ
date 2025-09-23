import { DollarSign, Edit, Trash } from 'lucide-react';


import { Button, Card, CardBody, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Image } from '@heroui/react';
import { capitalize } from '@/libs/utils';
import { convertToArgentinePeso } from '@/libs/helpers/number';

interface OrderDetailProps {
  handleEditProduct: (index: number) => void;
  handleDeleteProduct: (index: number) => void;
  onOpenChange: () => void;
  isOpen: boolean;
  productsList: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    selectedQuantity: number;
    image?: string;
  }>
}
export default function OrderDetail({ productsList, isOpen, onOpenChange, handleDeleteProduct, handleEditProduct }: OrderDetailProps) {

  if (!productsList || productsList.length === 0) {
    return <div className="text-center text-gray-500 mt-10">No hay productos agregados al pedido.</div>;
  }

  return (

        <Drawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            placement="bottom"
            size="full"

        >
            <DrawerContent>
                {() => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Resumen del Pedido
                            </h3>
                        </DrawerHeader>
                        <DrawerBody className="pb-10 pt-2">
                            {productsList.length > 0 && (
                                <div>
                                    <div className="mt-4">
                                        <ul aria-label="Productos agregados" className="w-full space-y-2">
                                            {productsList.map((product, index) => (
                                                <li
                                                    key={`${product.productId}-${product.quantity}`}
                                                >
                                                    <Card
                                                        shadow="sm">
                                                        <CardBody className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <Image src={product.image}
                                                                        alt={product.productName}
                                                                        width={60}
                                                                        height={60}
                                                                        className="object-cover rounded-md" />
                                                                    <div className="flex-1 ">
                                                                        <h4 className="font-semibold text-gray-900">{capitalize(product.productName)}</h4>
                                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                            <span>
                                                                                {product.selectedQuantity}
                                                                            </span>
                                                                            <span>×</span>
                                                                            <span>{convertToArgentinePeso(product.price)}</span>
                                                                            <span>=</span>
                                                                            <span className="font-semibold text-green-600">{convertToArgentinePeso(product.price * product.quantity)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center ">
                                                                    <Button
                                                                        variant="light"
                                                                        isIconOnly
                                                                        onPress={() => handleEditProduct(index)}
                                                                        className="h-8 w-8 hover:bg-blue-50 text-blue-600"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="light"
                                                                        isIconOnly
                                                                        onPress={() => handleDeleteProduct(index)}
                                                                        className="h-8 w-8 hover:bg-red-50 text-red-600"
                                                                    >
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </div>
                            )}
                        </DrawerBody>
                        <DrawerFooter className="bg-slate-50 p-6">
                            <div className="items-center justify-between flex w-full">
                                <span>Cantidad de productos: {productsList.length}</span>
                                <span className="text-lg font-semibold">Total: {convertToArgentinePeso(productsList.reduce((acc, p) => acc + (p.price * p.selectedQuantity), 0))}</span>
                            </div>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer >

  );

}
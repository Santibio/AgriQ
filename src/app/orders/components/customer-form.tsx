import { addCustomer } from "@/app/customers/actions";
import config from "@/config";
import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Input, Select, SelectItem } from "@heroui/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface FormWrapperProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const CustomerForm = () => {

    const [customerForm, setCustmerForm] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        fiscalCondition: "",
    });

    const [isLoading, setIsloading] = useState<boolean>(false);

    const handleOnchange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setCustmerForm((prev) => ({ ...prev, [name]: value }));
    };

    const validatePhoneNumber = (value: string) => value.match(/^\+?\d{7,15}$/);

    const isInvalid = useMemo(() => {
        if (customerForm.phone === "") return false;

        return validatePhoneNumber(customerForm.phone) ? false : true;
    }, [customerForm.phone]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsloading(true);

        const formData = new FormData();
        formData.append("name", customerForm.name);
        formData.append("lastName", customerForm.lastName);
        formData.append("email", customerForm.email);
        formData.append("phone", customerForm.phone);
        formData.append("fiscalCondition", customerForm.fiscalCondition);

        try {
            const response = await addCustomer(formData);

            if (response?.errors) {
                return toast.error("Ocurrió un error al procesar la solicitud.");
            }

            toast.success("Cliente agregado correctamente");

        } catch (error) {
            console.error("Error: ", error);
            toast.error(
                "Ocurrió un error al procesar la solicitud. Revisa si el usuario ya existe."
            );
        } finally {
            setIsloading(false);
        }
    };




    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Input
                    label="Nombre"
                    placeholder="Ingresar nombre"
                    name="name"
                    onChange={handleOnchange}
                    value={customerForm.name}
                    isRequired
                />
                <Input
                    label="Apellido"
                    placeholder="Ingresar apellido"
                    name="lastName"
                    onChange={handleOnchange}
                    value={customerForm.lastName}
                />
            </div>
            <Input
                label="Email"
                placeholder="Ingresar email"
                name="email"
                onChange={handleOnchange}
                value={customerForm.email}
                isRequired
                type="email"
            />
            <Input
                label="Teléfono"
                placeholder="Ingresar teléfono"
                name="phone"
                onChange={handleOnchange}
                value={customerForm.phone}
                isInvalid={isInvalid}
                color={isInvalid ? "danger" : undefined}
                errorMessage="Ingresa un teléfono válido"
            />
            <Select
                label="Información fiscal"
                labelPlacement="outside"
                name="fiscalCondition"
                placeholder="Selecciona la condición fiscal"
                value={customerForm.fiscalCondition}
                onChange={handleOnchange}
                defaultSelectedKeys={[customerForm.fiscalCondition]}
                className="mt-5"
                isRequired
            >
                {config.ficalInformation.map((info) => (
                    <SelectItem key={info.id}>{info.label}</SelectItem>
                ))}
            </Select>
            <Button
                type="submit"
                color="primary"
                variant="ghost"
                className="w-full mt-10"
                isLoading={isLoading}
            >
                Agregar Cliente
            </Button>
        </form>
    );
}

export default function FormWrapper({ isOpen, onOpenChange }: FormWrapperProps) {
    return (
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
                                Agregar cliente
                            </h2>
                        </DrawerHeader>
                        <DrawerBody className="pb-10 pt-2">
                            <CustomerForm />
                        </DrawerBody>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )
}
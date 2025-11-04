import { z } from "zod";

export const CreateProductionFormSchema = z.object({
  product: z.string({message: "Campo requerido"}).min(1, { message: "Campo requerido" }), // Se usa string().nonempty() para validar que no esté vacío
  quantity: z.number({message: "Campo requerido"}).min(1, { message: "Debe ser mayor a 1" }),
});

export type AddProductionInputs = z.infer<typeof CreateProductionFormSchema>;

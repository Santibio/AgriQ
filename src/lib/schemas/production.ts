import { z } from "zod";

export const CreateProductionFormSchema = z.object({
  product: z.string().min(1, { message: "Campo requerido" }), // Se usa string().nonempty() para validar que no esté vacío
  quantity: z.number().min(1, { message: "Campo requerido" }),
});

export type AddProductionInputs = z.infer<typeof CreateProductionFormSchema>;

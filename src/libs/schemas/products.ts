import { z } from "zod";

export const AddProductFormSchema = z.object({
  name: z.string().min(1, { message: "Campo requerido" }),
  image: z.instanceof(File, { message: "Debes subir una imagen válida" }),
  active: z.boolean(),
});

export type AddProductInputs = z.infer<typeof AddProductFormSchema>;

export const EditProductFormSchema = z.object({
  name: z.string().min(1, { message: "Campo requerido" }),
  image: z
    .instanceof(File, { message: "Debes subir una imagen válida" })
    .optional(),
  active: z.boolean(),
});

export type EditProductInputs = z.infer<typeof EditProductFormSchema>;


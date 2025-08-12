import { z } from "zod";

export const CustomerAddFormSchema = z.object({
  name: z.string().min(1, { message: "Campo obligatorio" }),
  lastName: z.string().min(1, { message: "Campo obligatorio" }),
  phone: z.string().max(13, { message: "Máx. 13 caracteres" }).optional().nullable(),
  email: z.string().email({ message: "Email inválido" }),
  fiscalCondition: z.enum([
    "RESPONSIBLE",
    "MONOTAX",
    "FINAL_CONSUMER",
    "EXEMPT",
  ]),
  active: z.boolean().optional(),
});
export type CustomerAddInputs = z.infer<typeof CustomerAddFormSchema>;

export const CustomerEditFormSchema = z.object({
  name: z.string().min(1, { message: "Campo obligatorio" }),
  lastName: z.string().min(1, { message: "Campo obligatorio" }),
  phone: z.string().max(13, { message: "Máx. 13 caracteres" }).optional().nullable(),
  email: z.string().email({ message: "Email inválido" }),
  fiscalCondition: z.enum([
    "RESPONSIBLE",
    "MONOTAX",
    "FINAL_CONSUMER",
    "EXEMPT",
  ]),
  active: z.boolean().optional(),
});
export type CustomerEditInputs = z.infer<typeof CustomerEditFormSchema>;
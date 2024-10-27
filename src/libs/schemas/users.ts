import { z } from "zod";

export const UserAddFormSchema = z
  .object({
    username: z.string().min(1, { message: "Campo requerido" }),
    role: z.string().min(1, { message: "Campo requerido" }),
    password: z.string().min(1, { message: "Campo requerido" }),
    confirmPassword: z.string().min(1, { message: "Campo requerido" }),
    lastName: z.string().min(1, { message: "Campo requerido" }),
    name: z.string().min(1, { message: "Campo requerido" }),
    avatar: z.instanceof(File).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Apunta al campo de confirmación de contraseña
  });

export type AddInputs = z.infer<typeof UserAddFormSchema>;

export const UserEditFormSchema = z
  .object({
    username: z.string().optional(),
    role: z.string().min(1, { message: "Campo requerido" }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    lastName: z.string().min(1, { message: "Campo requerido" }),
    name: z.string().min(1, { message: "Campo requerido" }),
    avatar: z.instanceof(File).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Apunta al campo de confirmación de contraseña
  });

export type EditInputs = z.infer<typeof UserEditFormSchema>;

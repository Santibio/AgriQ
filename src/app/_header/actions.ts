"use server";

import db from "@/libs/db";
import paths from "@/libs/paths";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const loginSchema = z.object({
  username: z
    .string()
    .min(3)
    .regex(/[a-z-]/, {
      message: "Solo minisculas y sin espacios en blanco",
    }),
  password: z.string().min(1),
});

interface LoginFormState {
  errors: {
    username?: string[];
    password?: string[];
    _form?: string[];
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function login(
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const result = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { username, password } = result.data;

  const user = await db.user.findUnique({ where: { username } });

  if (!user) {
    return {
      errors: {
        username: ["No se encontro el usuario"],
      },
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return {
      errors: {
        password: ["Contaseña incorrecta"],
      },
    };
  }

  // Generar JWT
  const token = jwt.sign({ name: user.name }, JWT_SECRET, { expiresIn: "1h" });

  // Configurar la cookie con el JWT
  const cookieStore = cookies();
  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: true, // Solo accesible desde el servidor
    path: "/", // Disponible en toda la aplicación
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
  });

  revalidatePath("/");
  redirect(paths.home());

}

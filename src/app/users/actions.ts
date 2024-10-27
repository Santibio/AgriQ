"use server";

import db from "@/libs/db";
import paths from "@/libs/paths";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserAddFormSchema, UserEditFormSchema } from "@/libs/schemas/users";
import { deleteImage, saveImage } from "@/libs/helpers/images";
import { encrypt } from "@/libs/helpers/encryptions";


interface UserFormState {
  errors: {
    username?: string[];
    role?: string[];
    password?: string[];
    confirmPassword?: string[];
    lastName?: string[];
    name?: string[];
    _form?: string[];
  };
  success?: boolean;
}

interface UpdatedUserData {
  role: string;
  name: string;
  lastName: string;
  password?: string;
  avatar?: string;
}

export async function addUser(formData: FormData): Promise<UserFormState> {
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const lastName = formData.get("lastName") as string;
  const name = formData.get("name") as string;
  const avatar = formData.get("avatar") as File;

  const data = { username, role, password, confirmPassword, lastName, name };
  const result = UserAddFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    const hashedPassword = await encrypt(result.data.password);
    let avatarPath = "";

    if (avatar) {
      // Usar la función reutilizable para guardar la imagen
      avatarPath = await saveImage(avatar, username, "avatars");
    }

    await db.user.create({
      data: {
        username: result.data.username,
        password: hashedPassword,
        role: result.data.role,
        name: result.data.name,
        lastName: result.data.lastName,
        avatar: avatarPath,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  const userPath = paths.users();
  revalidatePath(userPath);
  redirect(userPath);
}

export async function editUser(
  userId: number,
  formData: FormData
): Promise<UserFormState> {
  if (!userId) return { errors: { _form: ["No se envió el ID del usuario"] } };

  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const lastName = formData.get("lastName") as string;
  const name = formData.get("name") as string;
  const avatar = formData.get("avatar") as File;

  const data = { username, role, password, confirmPassword, lastName, name };
  const result = UserEditFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    const updatedData: UpdatedUserData = {
      role: result.data.role,
      name: result.data.name,
      lastName: result.data.lastName,
    };

    if (password) updatedData.password = await encrypt(password);
    if (avatar)  updatedData.avatar = await saveImage(avatar, username, "avatars");


    await db.user.update({
      where: { id: userId },
      data: updatedData,
    });
  } catch (err) {
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  const userPath = paths.users();
  revalidatePath(userPath);
  redirect(userPath);
}

interface deleteUserResponse {
  error?: string;
}

export async function deleteUser(userId: number): Promise<deleteUserResponse> {
  try {
    const user = await db.user.delete({
      where: {
        id: userId,
      },
    });
    await deleteImage(user.username, "avatars");
    revalidatePath(paths.users());
    return {};
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Something went wrong",
    };
  }
}

"use server";

import db from "@/lib/db";
import paths from "@/lib/paths";
import { revalidatePath } from "next/cache";
import { UserAddFormSchema, UserEditFormSchema } from "@/lib/schemas/users";
import { saveImage } from "@/lib/helpers/images";
import { encrypt } from "@/lib/helpers/encryptions";
import { Role } from "@prisma/client";

interface UserFormState {
  errors?:
    | {
        username?: string[];
        role?: string[];
        password?: string[];
        confirmPassword?: string[];
        lastName?: string[];
        name?: string[];
        _form?: string[];
      }
    | false;
}
interface UpdatedUserData {
  role: Role;
  name: string;
  lastName: string;
  password?: string;
  avatar?: string;
  active?: boolean;
}

export async function addUser(formData: FormData): Promise<UserFormState> {
  const username = formData.get("username") as string;
  const role = formData.get("role") as string as Role;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const lastName = formData.get("lastName") as string;
  const name = formData.get("name") as string;
  const avatar = formData.get("avatar") as File;
  const active = formData.get("active") === "true";

  const data = {
    username,
    role,
    password,
    confirmPassword,
    lastName,
    name,
    active,
  };
  const result = UserAddFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    const hashedPassword = await encrypt(result.data.password);
    let avatarPath = "";

    if (avatar) {
      // Usar la función reutilizable para guardar la imagen
      avatarPath = await saveImage(avatar);
    }

    await db.user.create({
      data: {
        username: result.data.username,
        password: hashedPassword,
        role: result.data.role as Role,
        name: result.data.name,
        lastName: result.data.lastName,
        avatar: avatarPath,
        active: result.data.active,
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
  return { errors: false };
  // redirect(userPath);
}

export async function editUser(
  userId: number,
  formData: FormData
): Promise<UserFormState> {
  if (!userId) return { errors: { _form: ["No se envió el ID del usuario"] } };

  const username = formData.get("username") as string;
  const role = formData.get("role") as Role;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const lastName = formData.get("lastName") as string;
  const name = formData.get("name") as string;
  const avatar = formData.get("avatar") as File;
  const active = formData.get("active") === "true";

  const data = {
    username,
    role,
    password,
    confirmPassword,
    lastName,
    name,
    active,
  };
  const result = UserEditFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    const updatedData: UpdatedUserData = {
      role: result.data.role as Role,
      name: result.data.name,
      lastName: result.data.lastName,
      active: result.data.active,
    };

    if (password) updatedData.password = await encrypt(password);
    if (avatar) updatedData.avatar = await saveImage(avatar);

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
  // redirect(userPath);
  return { errors: false };
}

interface DeleteUserResponse {
  error?: string;
}

export async function deleteUser(userId: number): Promise<DeleteUserResponse> {
  try {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        active: false,
      },
    });
    // await deleteImage(user.username, "avatars");
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

export async function activeUser(userId: number): Promise<DeleteUserResponse> {
  try {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        active: true,
      },
    });
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

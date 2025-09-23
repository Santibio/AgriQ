"use server";

import db from "@/libs/db";
import paths from "@/libs/paths";
import { revalidatePath } from "next/cache";
import { FiscalCondition } from "@prisma/client";

interface CustomerFormState {
  errors?:
    | {
        name?: string[];
        lastName?: string[];
        email?: string[];
        phone?: string[];
        fiscalCondition?: string[];
        _form?: string[];
      }
    | false;
}

export async function addCustomer(
  formData: FormData
): Promise<CustomerFormState> {
  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const fiscalCondition = formData.get("fiscalCondition") as FiscalCondition;

  const data = {
    name,
    lastName,
    email,
    phone,
    fiscalCondition,
  };

  try {
    await db.customer.create({
      data,
    });
  } catch (err) {
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  const userPath = paths.customers();
  revalidatePath(userPath);
  return { errors: false };
}

export async function editCustomer(
  userId: number,
  formData: FormData
): Promise<CustomerFormState> {
  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const fiscalCondition = formData.get("fiscalCondition") as FiscalCondition;

  const data = {
    name,
    lastName,
    email,
    phone,
    fiscalCondition,
  };

  try {
    await db.customer.update({
      where: { id: userId },
      data,
    });
  } catch (err) {
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  const customerPath = paths.customers();
  revalidatePath(customerPath);

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

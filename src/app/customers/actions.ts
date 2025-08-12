"use server";

import db from "@/libs/db";
import paths from "@/libs/paths";
import { revalidatePath } from "next/cache";
import {
  CustomerAddFormSchema,
  CustomerEditFormSchema,
} from "@/libs/schemas/customers";

interface CustomerFormState {
  errors?:
    | {
        name?: string[];
        lastName?: string[];
        phone?: string[];
        email?: string[];
        fiscalCondition?: string[];
        active?: string[];
        _form?: string[];
      }
    | false;
}

export async function addCustomer(formData: FormData): Promise<CustomerFormState> {
  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const fiscalCondition = formData.get("fiscalCondition") as string;
  const active = formData.get("active") === "true";

  const data = { name, lastName, phone, email, fiscalCondition, active };
  const result = CustomerAddFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    await db.customer.create({
      data: {
        name: result.data.name,
        lastName: result.data.lastName,
        phone: result.data.phone || "",
        email: result.data.email || "",
        fiscalCondition: result.data.fiscalCondition,
        active: result.data.active ?? true,
      },
    });
  } catch (err) {
    if (err instanceof Error) return { errors: { _form: [err.message] } };
    return { errors: { _form: ["Something went wrong"] } };
  }

  revalidatePath(paths.customers());
  return { errors: false };
}

export async function editCustomer(
  customerId: number,
  formData: FormData
): Promise<CustomerFormState> {
  if (!customerId) return { errors: { _form: ["No se envió el ID del cliente"] } };

  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const fiscalCondition = formData.get("fiscalCondition") as string;
  const active = formData.get("active") === "true";

  const data = { name, lastName, phone, email, fiscalCondition, active };
  const result = CustomerEditFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    await db.customer.update({
      where: { id: customerId },
      data: {
        name: result.data.name,
        lastName: result.data.lastName,
        phone: result.data.phone || "",
        email: result.data.email || "",
        fiscalCondition: result.data.fiscalCondition,
        active: result.data.active ?? true,
      },
    });
  } catch (err) {
    if (err instanceof Error) return { errors: { _form: [err.message] } };
    return { errors: { _form: ["Something went wrong"] } };
  }

  revalidatePath(paths.customers());
  return { errors: false };
}

interface ActionResponse {
  error?: string;
}

export async function deleteCustomer(customerId: number): Promise<ActionResponse> {
  try {
    await db.customer.update({
      where: { id: customerId },
      data: { active: false },
    });
    revalidatePath(paths.customers());
    return {};
  } catch (err: unknown) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Something went wrong" };
  }
}

export async function activeCustomer(customerId: number): Promise<ActionResponse> {
  try {
    await db.customer.update({
      where: { id: customerId },
      data: { active: true },
    });
    revalidatePath(paths.customers());
    return {};
  } catch (err: unknown) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Something went wrong" };
  }
}
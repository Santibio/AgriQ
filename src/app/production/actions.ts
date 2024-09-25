"use server";
import db from "@/libs/db";
import paths from "@/libs/paths";
import {
  AddProductionInputs,
  CreateProductionFormSchema,
} from "@/libs/schemas/production";
import { getCurrentUser } from "@/libs/session";
import { redirect } from "next/navigation";

interface ProductionFormState {
  errors?: {
    product?: string[];
    cuantity?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export async function createProduction(
  formInput: AddProductionInputs
): Promise<ProductionFormState> {
  try {
    const parseResult = CreateProductionFormSchema.safeParse(formInput);

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return {
        errors: {
          product: errors.product || [],
          cuantity: errors.cuantity || [],
        },
      };
    }

    const user = await getCurrentUser();

    if (!user)
      return {
        errors: {
          _form: ["No se encontró el usuario actual"],
        },
      };

    await db.production.create({
      data: {
        cuantity: parseResult.data.cuantity,
        productId: parseInt(parseResult.data.product),
        userId: user.id,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  redirect(paths.home());
}

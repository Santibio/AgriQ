"use server";
import db from "@/lib/db";
import paths from "@/lib/paths";
import {
  AddProductionInputs,
  CreateProductionFormSchema,
} from "@/lib/schemas/production";
import { getCurrentUser } from "@/lib/session";
import { MovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

interface ProductionFormState {
  errors?:
    | {
        product?: string[];
        quantity?: string[];
        _form?: string[];
      }
    | false;
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
          quantity: errors.quantity || [],
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
    // Crear el movimiento de producción

    const movement = await db.movement.create({
      data: {
        type: MovementType.STORED,
        userId: user.id,
      },
    });

    const codeValue = `${parseInt(parseResult.data.product)}-${Date.now()}`;

    const batch = await db.batch.create({
      data: {
        initialQuantity: parseResult.data.quantity,
        depositQuantity: parseResult.data.quantity,
        code: codeValue,
        productId: parseInt(parseResult.data.product),
        marketQuantity: 0,
        sentQuantity: 0,
        receivedQuantity: 0,
        discardedQuantity: 0,
        reservedQuantity: 0,
        soltQuantity: 0,
        // Add any other required fields with default values if necessary
      },
    });

    // Crear el detalle del movimiento
    await db.movementDetail.create({
      data: {
        batchId: batch.id,
        movementId: movement.id,
        quantity: parseResult.data.quantity,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  revalidatePath(paths.production());
  return { errors: false };

  // redirect(paths.production());
}
export async function editProduction(
  batchId: number,
  formInput: AddProductionInputs
): Promise<ProductionFormState> {
  try {
    const parseResult = CreateProductionFormSchema.safeParse(formInput);

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return {
        errors: {
          product: errors.product || [],
          quantity: errors.quantity || [],
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

    const movement = await db.movement.create({
      data: {
        type: MovementType.EDITED,
        userId: user.id,
      },
    });

    const batch = await db.batch.update({
      where: { id: batchId },
      data: {
        initialQuantity: parseResult.data.quantity,
        depositQuantity: parseResult.data.quantity,
        productId: parseInt(parseResult.data.product),
      },
    });

    await db.movementDetail.create({
      data: {
        batchId: batch.id,
        movementId: movement.id,
        quantity: parseResult.data.quantity,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } };
    }
    return { errors: { _form: ["Something went wrong..."] } };
  }

  revalidatePath(paths.production());
  return { errors: false };

}

"use server";
import db from "@/lib/db";
import paths from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";
import { DiscardReason, MovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface ProductionFormState {
  errors?:
    | {
        product?: string[];
        quantity?: string[];
        _form?: string[];
      }
    | false;
}

export async function createDiscard(
  batchId: number,
  formData: FormData
): Promise<ProductionFormState> {
  const reason = formData.get("reason") as DiscardReason;
  const productToDescard = formData.get("productToDescard") as string;
  const quantity = Number(productToDescard);
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        errors: {
          _form: ["Usuario no autenticado"],
        },
      };
    }

    await db.$transaction(async (tx) => {
      // 1. Crear el movimiento de tipo SENT
      const movement = await tx.movement.create({
        data: {
          type: MovementType.DISCARDED,
          userId: user.id,
        },
      });

      await tx.movementDetail.create({
        data: {
          movementId: movement.id,
          batchId,
          quantity: quantity,
        },
      });

      await tx.discard.create({
        data: {
          movementId: movement.id,
          reason: reason,
        },
      });

      await tx.batch.update({
        where: { id: batchId },
        data: {
          depositQuantity: {
            decrement: quantity,
          },
          discardedQuantity: {
            increment: quantity,
          },
        },
      });
    });

    revalidatePath(paths.discardAdd());
    return { errors: false };
  } catch (error) {
    console.log("error: ", error);
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    } else {
      return {
        errors: {
          _form: ["Ocurrió un error desconocido"],
        },
      };
    }
  }
}

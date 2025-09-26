"use server";
import db from "@/lib/db";
import paths from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";
import { MovementType, ShipmentStatus } from "@prisma/client";
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

interface FormData {
  batchId: number;
  quantity: number;
  discrepancyQuantity: number;
}

export async function createShipmentReception(
  shipmentId: number,
  hasDiscrepancy: boolean,
  formData: FormData[]
): Promise<ProductionFormState> {
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
      // 1. Actualizar el estado del envio a RECIEVED_OK

      if (hasDiscrepancy) {
        await tx.shipment.update({
          where: { id: shipmentId },
          data: {
            status: ShipmentStatus.RECEIVED_NO_OK,
          },
        });
      } else {
        await tx.shipment.update({
          where: { id: shipmentId },
          data: {
            status: ShipmentStatus.RECEIVED_OK,
          },
        });
      }
      // 2. Crear el movimiento de tipo RECEIVED_MARKET
      const movement = await tx.movement.create({
        data: {
          type: MovementType.RECEIVED_MARKET,
          userId: user.id,
        },
      });

      // 3. Crear los detalles y actualizar los lotes
      for (const item of formData) {
        const { batchId, quantity, discrepancyQuantity } = item;
        await tx.movementDetail.create({
          data: {
            movementId: movement.id,
            batchId,
            quantity,
          },
        });

        await tx.batch.update({
          where: { id: batchId },
          data: {
            marketQuantity: {
              increment: quantity,
            },
            sentQuantity: {
              decrement: quantity,
            },
            discrepancyQuantity: {
              increment: discrepancyQuantity,
            },
          },
        });
      }
    });

    revalidatePath(paths.shipmentReception());
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

"use server";
import db from "@/libs/db";
import paths from "@/libs/paths";
import { getCurrentUser } from "@/libs/session";
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

interface AddedProduct {
  id: number | undefined;
  product: string;
  quantity: number;
}

export async function createShipment(
  formInput: AddedProduct[]
): Promise<ProductionFormState> {
  try {
    // Obtiene el usuario actual
    const user = await getCurrentUser();

    // Verifica si el usuario está autenticado
    if (!user) {
      return {
        errors: {
          _form: ["Usuario no autenticado"],
        },
      };
    }

    const shipmentProductions = []; // Almacenará los datos para el nuevo Shipment
    // Procesa cada producto en formInput
    for (const input of formInput) {
      let quantityToShip = input.quantity; // Cantidad que se debe enviar

      // Obtener las producciones más antiguas de este producto, ordenadas por fecha de creación (FIFO)
      const oldProductions = await db.batch.findMany({
        where: {
          productId: input.id, // Filtra por el producto
        /*   remainingQuantity: {
            gt: 0, // Solo producciones con cantidad restante mayor a 0
          }, */
        },
        orderBy: {
          createdAt: "asc", // Ordena por las más antiguas primero
        },
      });

      // Itera sobre las producciones más antiguas y resta cantidades
      for (const production of oldProductions) {
        if (quantityToShip <= 0) break; // Si ya hemos asignado toda la cantidad a enviar, terminamos

        const availableQuantity = 0;

        // Verifica cuánto de la producción podemos usar en este envío
        const quantityToUse = Math.min(availableQuantity, quantityToShip);

        // Actualiza el remainingQuantity de esta producción
    /*     await db.production.update({
          where: { id: production.id },
          data: { remainingQuantity: availableQuantity - quantityToUse },
        }); */

        // Añade esta producción al nuevo envío
        shipmentProductions.push({
          productionId: production.id,
          initialQuantity: quantityToUse,
          recivedQuantity: 0, // Inicialmente no se ha recibido nada
          currentQuantity: quantityToUse, // La cantidad actual es la que se ha usado
        });

        // Resta la cantidad usada de la cantidad total que se debe enviar
        quantityToShip -= quantityToUse;
      }

      // Si no hay suficiente stock, se podría lanzar un error (opcional)
      if (quantityToShip > 0) {
        return {
          errors: {
            _form: [`No hay suficiente stock para ${input.product}`],
          },
        };
      }
    }
    // Crea el nuevo envío (Shipment) con las producciones utilizadas
    /* await db.shipment.create({
      data: {
        userId: user.id, // Asocia el envío con el usuario actual
        shipments: {
          create: shipmentProductions, // Crea las relaciones con las producciones usadas
        },
      },
    }); */

    // Redirige a la página de envíos tras la creación exitosa
    revalidatePath(paths.shipments());
    return { errors: false };
  } catch (error) {
    // Manejo de errores
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

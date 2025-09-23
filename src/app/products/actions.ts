"use server";

import { revalidatePath } from "next/cache";
import paths from "@/libs/paths";
import db from "@/libs/db";
import { Prisma } from "@prisma/client";
import { saveImage } from "@/libs/helpers/images";
import {
  AddProductFormSchema,
  EditProductFormSchema,
} from "@/libs/schemas/products";
import { generateNextProductCode } from "@/libs/helpers/products";

interface ProductFormState {
  errors?:
  | {
    name?: string[];
    image?: string[];
    active?: string[];
    price?: string[];
    _form?: string[];
  }
  | false;
}

// Función para manejar errores de la base de datos
function handleDatabaseError(err: unknown): ProductFormState {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return {
          errors: {
            _form: ["El nombre del producto ya existe"],
          },
        };
      default:
        return {
          errors: {
            _form: [err.message],
          },
        };
    }
  } else if (err instanceof Error) {
    return {
      errors: {
        _form: [err.message],
      },
    };
  } else {
    return {
      errors: {
        _form: ["Algo salió mal..."],
      },
    };
  }
}

export async function addProduct(
  formData: FormData
): Promise<ProductFormState> {
  try {
    // Obtener los datos del formulario
    const name = formData.get("name") as string;
    const active = formData.get("active") === "true";
    const image = formData.get("image") as File | null;
    const price = Number(formData.get("price") as string) || 0;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const presentation = formData.get("presentation") as string;

    // Validar los datos del formulario usando el esquema de Zod
    const parseResult = AddProductFormSchema.safeParse({
      name,
      active,
      image,
      price,
      category,
      type,
      presentation,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return {
        errors: {
          name: errors.name || [],
          image: errors.image || [],
          price: errors.price || [],
        },
      };
    }

    const formattedName = name.toLowerCase().trim();

    // Guardar la imagen usando la función `saveImage`
    const imagePath = image ? await saveImage(image) : "";

    // Crear el producto en la base de datos
    await db.product.create({
      data: {
        name: formattedName,
        active,
        image: imagePath,
        code: await generateNextProductCode(category, type, presentation),
        price: price,
        category,
        type,
        presentation,
      },
    });
  } catch (err) {
    return handleDatabaseError(err);
  }
  // Revalidar la ruta y redirigir
  revalidatePath(paths.products());
  // redirect(paths.products());
  return { errors: false };
}

export async function editProduct(
  productId: number,
  formData: FormData
): Promise<ProductFormState> {
  try {
    // Obtener los datos del formulario
    const name = formData.get("name") as string;
    const active = formData.get("active") === "true";
    const image = formData.get("image") as File | null;
    const price = Number(formData.get("price") as string);
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const presentation = formData.get("presentation") as string;

    // Validar los datos del formulario usando el esquema de Zod
    const parseResult = EditProductFormSchema.safeParse({
      name,
      active,
      ...(image ? { image } : {}),
      price,
      category,
      type,
      presentation,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return {
        errors: {
          name: errors.name || [],
          image: errors.image || [],
          price: errors.price || [],
        },
      };
    }

    const formattedName = name.toLowerCase().trim();

    // Verificar si el producto existe
    const existingProduct = await db.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return {
        errors: {
          _form: ["El producto no existe"],
        },
      };
    }

    let imagePath = existingProduct.image;

    // Si hay una nueva imagen, guardarla
    if (image) {
      imagePath = await saveImage(image);
    }

    // Actualizar el producto en la base de datos
    await db.product.update({
      where: { id: productId },
      data: {
        name: formattedName,
        active,
        image: imagePath,
        price,
      },
    });
  } catch (err: unknown) {
    return handleDatabaseError(err);
  }
  // Revalidar la ruta y redirigir
  revalidatePath(paths.products());
  // redirect(paths.products());
  return { errors: false };
}



import config from "@/config";
import db from "@/lib/db";

export async function generateNextProductCode(category: string, type: string, presentation: string): Promise<string> {
  // 1. Obtener los códigos de la configuración
  const categoryConfig = config.productCategories.find((cat) => cat.id === category);
  if (!categoryConfig) {
    throw new Error(`Category with id "${category}" not found in config.`);
  }
  const typeConfig = categoryConfig.type.find((t) => t.id === type);
  if (!typeConfig) {
    throw new Error(`Type with id "${type}" not found in category "${category}".`);
  }
  const presentationConfig = typeConfig.presentation.find((p) => p.id === presentation);
  if (!presentationConfig) {
    throw new Error(`Presentation with id "${presentation}" not found in type "${type}".`);
  }

  const codCategoria = categoryConfig.cod;
  const codType = typeConfig.cod;
  const codPresentation = presentationConfig.cod;

  // 2. Calcular el incremental
  const productsCount = await db.product.count({
    where: {
      category: category,
      type: type,
    },
  });

  const incremental = (productsCount + 1).toString().padStart(2, "0");

  // 3. Construir el código final
  const finalCode = `${codCategoria}${codType}${incremental}${codPresentation}`;

  return finalCode;
}

import db from "@/libs/db";

export async function generateNextProductCode(): Promise<string> {
  const lastProduct = await db.product.findFirst({
    orderBy: { id: "desc" },
  });
  return (lastProduct?.code ? parseInt(lastProduct.code) + 1 : 1)
    .toString()
    .padStart(3, "0");
}

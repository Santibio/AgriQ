import PageTitle from "@/components/page-title";
import db from "@/lib/db";
import BatchsList from "../components/batchs-list";

export default async function DiscardAddPage() {
  const batchsInDeposit = await db.batch.findMany({
    include: {
      product: true,
    },
    where: {
      depositQuantity: {
        gt: 0,
      },
    },
  });

  const batchsInDepositSorted = [...batchsInDeposit].sort((a, b) => {
    return a.product.name.localeCompare(b.product.name);
  });

  return (
    <section className="flex flex-col justify-between gap-6 px-6">
      <PageTitle>Crear descarte</PageTitle>
      <BatchsList batchs={batchsInDepositSorted} />
    </section>
  );
}

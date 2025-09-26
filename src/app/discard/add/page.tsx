import PageTitle from "@/components/page-title";
import db from "@/lib/db";
import BatchsList from "../components/batchs-list";

export default async function Shipments() {
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

  return (
    <section className="flex flex-col justify-between gap-6 px-6">
      <PageTitle>Generar descarte</PageTitle>
      <BatchsList batchs={batchsInDeposit} />
    </section>
  );
}

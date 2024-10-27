import PageTitle from '@/components/page-title';
import db from '@/libs/db';
import ShipmentsList from './components/shipments-list';

import AddButton from '@/components/buttons/add-button';
import paths from '@/libs/paths';

export default async function Shipments() {
const shipments = await db.shipment.findMany({
  include: {
    shipments: {
      include: {
        production: {
          include: {
            product: true, 
          },
        },
      },
    },
    user: true,
  },
}); 

 return (
  <section className="flex flex-col justify-between gap-6">
    <PageTitle>Envíos</PageTitle>
    <ShipmentsList shipments={shipments} />
    <AddButton href={paths.shipmentAdd()}>
      Crear envío
    </AddButton>
  </section>
);
}

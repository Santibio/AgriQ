import ListPage from '@/components/layout/list-page'
import ShipmentsList from './components/shipments-list'
import { getShipments } from '@/services/shipments.service'
import ShipmentAction from './components/shipment-action'

export default async function Shipments() {
  const shipments = await getShipments()

  // Sort the shipments in-memory by the first product's name
  shipments.sort((a, b) => {
    const productAName = a.movement?.movementDetail[0]?.batch.product.name
    const productBName = b.movement?.movementDetail[0]?.batch.product.name

    if (!productAName) return 1 // Shipments without products go to the end
    if (!productBName) return -1

    return productAName.localeCompare(productBName)
  })

  return (
    <ListPage title='Envíos' actions={<ShipmentAction />}>
      <ShipmentsList list={shipments} />
    </ListPage>
  )
}

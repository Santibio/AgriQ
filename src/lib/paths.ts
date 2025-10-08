const paths = {
  home() {
    return '/'
  },
  login() {
    return `/login`
  },
  users() {
    return `settings/users`
  },
  userEdit(userId: string) {
    return `users/${userId}`
  },
  userAdd() {
    return 'users/add'
  },
  products() {
    return 'settings/products'
  },
  productAdd() {
    return 'products/add'
  },
  productEdit(productId: string) {
    return `products/${productId}`
  },
  shipments() {
    return `/shipments`
  },
  shipmentAdd(origin: string, destination: string) {
    return `/shipments/add?origin=${origin}&destination=${destination}`
  },
  shipmentEdit(shipmentId: string) {
    return `/shipments/${shipmentId}`
  },
  production() {
    return `/production`
  },
  productionEdit(productionId: string) {
    return `/production/${productionId}`
  },
  productionAdd() {
    return `/production/add`
  },
  customers() {
    return `/customers`
  },
  customerAdd() {
    return `/customers/add`
  },
  customerEdit(customerId: string) {
    return `/customers/${customerId}`
  },
  discard() {
    return `/discard`
  },
  discardAdd() {
    return `/discard/add`
  },
  shipmentReception() {
    return `/shipments-reception`
  },
  shipmentReceptionEdit(shipmentId: string) {
    return `/shipments-reception/${shipmentId}`
  },
  orders() {
    return `/orders`
  },
  orderAdd() {
    return `/orders/add`
  },
  orderToEdit(orderId: string) {
    return `/orders/edit?id=${orderId}`
  },
  orderToCharge(orderId: string) {
    return `/orders/payment?id=${orderId}`
  },
  orderToMovements(orderId: string) {
    return `/orders/movements?id=${orderId}`
  },
  movements() {
    return `/movements`
  },
  sales() {
    return `/sales`
  },
  prices() {
    return `settings/prices`
  },
  profile() {
    return `settings/profile`
  },
}

export default paths

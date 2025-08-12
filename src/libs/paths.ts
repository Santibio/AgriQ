const paths = {
  home() {
    return "/";
  },
  login() {
    return `/login`;
  },
  users() {
    return `/users`;
  },
  userEdit(userId: string) {
    return `/users/${userId}`;
  },
  userAdd() {
    return "/users/add";
  },
  products() {
    return `/products`;
  },
  productAdd() {
    return `/products/add`;
  },
  productEdit(productId: string) {
    return `/products/${productId}`;
  },
  shipments() {
    return `/shipments`;
  },
  shipmentAdd() {
    return `/shipments/add`;
  },
  production() {
    return `/production`;
  },
  productionEdit(productionId: string) {
    return `/production/${productionId}`;
  },
  productionAdd() {
    return `/production/add`;
  },
  customers() {
    return `/customers`;
  },
  customerAdd() {
    return `/customers/add`;
  },
  customerEdit(customerId: string) {
    return `/customers/${customerId}`;
  },
};

export default paths;

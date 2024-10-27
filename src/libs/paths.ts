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
};

export default paths;

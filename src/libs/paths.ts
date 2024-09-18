const paths = {
  home() {
    return "/";
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
};

export default paths;

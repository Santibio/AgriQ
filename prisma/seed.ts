import { PrismaClient, Product, Role } from "@prisma/client";

const prisma = new PrismaClient();

const initialUsers = [
  {
    username: "admin",
    password: "$2a$10$V8/J106/FqipLrC9lAQgweyylLXR3l0iNw4XaFyQ8OMYBPZd/hp06",
    role: Role.ADMIN,
    name: "Eve",
    lastName: "Perez",
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730323872/cszbndvswdehdcllgkje.jpg`,
    active: true,
  },
  {
    username: "seller",
    password: "$2a$10$V8/J106/FqipLrC9lAQgweyylLXR3l0iNw4XaFyQ8OMYBPZd/hp06",
    role: Role.SELLER,
    name: "Fabri",
    lastName: "Perez",
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730323872/hu4lguwldlcjhqdxr7rv.jpg`,
    active: true,
  },
  {
    username: "deposit",
    password: "$2a$10$V8/J106/FqipLrC9lAQgweyylLXR3l0iNw4XaFyQ8OMYBPZd/hp06",
    role: Role.DEPOSIT,
    name: "Santiago",
    lastName: "Perez",
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730323872/kbhi0ukhcmwuxynf1tau.jpg`,
    active: true,
  },
];
const initialProducts: Product[] = [
  { id: 1, code: "21011", name: "Achicoria hoja ancha", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869436/q1d0uxmqan0v8o1n2jmt.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, code: "21021", name: "Achicoria hoja fina", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339962/p5keuhcw3ptyglfn26gr.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, code: "11011", name: "Ajenjo", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869821/fbqu31eydqtdcgvaur35.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, code: "12142", name: "Ajenjo Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870239/d2l5khsgfzm0pbftlbre.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, code: "23011", name: "Aji picante", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870089/gx1t9nuwrokgnfmwuzk6.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, code: "23052", name: "Aji picante Plantin", category: "hortalizas", type: "varios", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870313/gslczd5aflxyz7ytcvwh.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 7, code: "21031", name: "Akusay", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869553/ciahpoh3sooq8n67fcih.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 8, code: "12011", name: "Albahaca hidropónica", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 2300, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869918/dyxinigpzl4ukmh3eqdy.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 9, code: "12152", name: "Albahaca Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869657/hoquy2nyzpdojoo1irfv.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 10, code: "11021", name: "Azafran", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 3000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340360/gvtldo42yo2xwqeahpvo.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 11, code: "21041", name: "Bamia", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340230/uqr8vzpyopqcwpx4ybqz.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 12, code: "23021", name: "Berenjena baby", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869500/trgajgmspvhhejizn9df.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 13, code: "21051", name: "Berro", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870398/fdvwp1swsq0ecrxppdsm.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 14, code: "11031", name: "Burro", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869849/t47air57k7tzby0ikf5c.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 15, code: "12162", name: "Burro Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870436/gsmgfvgrsg0khizdlie1.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 16, code: "21061", name: "Cardo", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870520/iwm0qcl9if1xeubjzrk9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 17, code: "11041", name: "Cedron", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869835/n3jsb5lk5o0fer0jmcmb.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 18, code: "12021", name: "Ciboulette", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 2500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339928/uubj43kdrywc9nnwumxv.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 19, code: "12172", name: "Ciboulette Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870571/oyztjinhu5jyghnps7jn.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 20, code: "12031", name: "Cilantro", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340004/ovyvvsqpbkwe1gjhfvkt.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 21, code: "12182", name: "Cilantro Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870598/p7bdccjavfdbww7782h9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 22, code: "12041", name: "Eneldo", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340129/jnnkuvwfcabvsebdv1vr.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 23, code: "21071", name: "Escarola", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869716/z6tektlc5tv5xrbizopm.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 24, code: "21081", name: "Espinaca", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870106/xwvhydg9kl4tabfdyefi.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 25, code: "12051", name: "Estragon", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869945/dyjpazamizx84vpmsto9.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 26, code: "12061", name: "Hierba buena", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339812/q4b7a1siwkduxsbdcxmj.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 27, code: "12192", name: "Hierba buena Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870636/zm7l32dbgurra30w0knp.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 28, code: "12071", name: "Huacatay", category: "aromaticas", type: "frescas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340311/idovlz8kbj3zltr2tkxj.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 29, code: "21091", name: "Kale morado", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339897/eeaxp42pbhkhnbciicox.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 30, code: "21101", name: "Kale verde", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339876/pv4ngrplpqmfbfufyriu.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 31, code: "22011", name: "Kreen", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: true, price: 3000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869281/kt6txkzx9tq8qm9idiux.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 32, code: "11061", name: "Laurel", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869987/peqnn7ekbdkm3kboboug.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 33, code: "12081", name: "Lemon Grass", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 1500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340035/yjzsdzoj5ikxlaa6qumh.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 34, code: "11051", name: "Malva", category: "aromaticas", type: "secas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870668/ygwckme2o9lio9y2mnqw.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 35, code: "12091", name: "Menta", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339378/gxov8yisjnc1z1xucy7r.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 36, code: "12202", name: "Menta Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339434/ssz8dhsua0luuzh3cznn.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 37, code: "12101", name: "Oregano", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339549/wrt5gwou96rpdmjqoej3.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 38, code: "12212", name: "Oregano Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339591/mypesthfhnhxdvrla7n9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 39, code: "21111", name: "Pak choy", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870153/sjbwey0onhm6rtlhhtib.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 40, code: "11071", name: "Peperina", category: "aromaticas", type: "secas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870719/q7qlwrro5wy4blnlizyb.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 41, code: "23031", name: "Pepinillo", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869335/x5flrjlysppn3jgvuj2w.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 42, code: "22021", name: "Rabano negro", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870755/hxylntl2fv8hx9llnj0z.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 43, code: "22031", name: "Rabano rojo", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869316/x3d3yoilnjdv1su632sy.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 44, code: "22041", name: "Radicchetta", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870881/skskhn3gilki7y9hpo37.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 45, code: "21121", name: "Radicchio", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 2000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869782/vlukgbp2y1mzyiw6qofc.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 46, code: "12111", name: "Romero", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339468/wsv2zun8dxenhcvcssjb.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 47, code: "12222", name: "Romero Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339513/krrw2uipvndbg35gj0e6.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 48, code: "21131", name: "Rucula", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339835/m8jfjtpp6wraaq6q0bvp.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 49, code: "12121", name: "Salvia", category: "aromaticas", type: "frescas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869462/zhkhsxlyosevmhyoqj17.png`, createdAt: new Date(), updatedAt: new Date() },
  { id: 50, code: "12232", name: "Salvia Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870929/b0zcgzlamphxt0u0ec9g.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 51, code: "12131", name: "Tomillo", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339775/mn9ueglv4zadyo3hteiz.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 52, code: "12242", name: "Tomillo Plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870967/vkjpkwjtshieidujzjg5.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 53, code: "23041", name: "Zuccini amarillo", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757871014/uyrlr4xsypaxqmgt7myb.jpg`, createdAt: new Date(), updatedAt: new Date() },
];




async function main() {
  console.log("Start seeding...");

  // Eliminar registros existentes
  await prisma.movementDetail.deleteMany();
  await prisma.discard.deleteMany();
  await prisma.orderDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.movement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Crear usuarios
  await prisma.user.createMany({
    data: initialUsers,
  });

  // Crear productos
  await prisma.product.createMany({
    data: initialProducts,
  });

  // Obtener los primeros IDs de usuarios y productos creados
  /*  const userEve = await prisma.user.findFirst({
     where: { username: "eve.perez" },
   });
   const userFabri = await prisma.user.findFirst({
     where: { username: "fabri.perez" },
   });
   const productLettuce = await prisma.product.findFirst({
     where: { name: "lechuga" },
   });
   const productTomato = await prisma.product.findFirst({
     where: { name: "tomate" },
   }); */

  // Crear producciones
  /*  await prisma.production.createMany({
    data: [
      {
        quantity: 100,
        remainingQuantity: 100,
        productId: productLettuce?.id as number, // ID del producto lechuga
        userId: userEve?.id as number, // ID del usuario Eve
      },
      {
        quantity: 200,
        remainingQuantity: 100,
        productId: productTomato?.id as number, // ID del producto tomate
        userId: userFabri?.id as number, // ID del usuario Fabri
      },
    ],
  }); */

  // Obtener los IDs de las producciones recién creadas
  /* const productionLettuce = await prisma.production.findFirst({
    where: {
      productId: productLettuce?.id as number,
      userId: userEve?.id as number,
    },
  });
  const productionTomato = await prisma.production.findFirst({
    where: {
      productId: productTomato?.id as number,
      userId: userFabri?.id as number,
    },
  }); */

  // Crear envíos
  /*  await prisma.shipment.createMany({
    data: [
      {
        userId: userEve?.id as number, // ID del usuario Eve
      },
      {
        userId: userFabri?.id as number, // ID del usuario Fabri
      },
    ],
  });
 */
  // Obtener los IDs de los envíos recién creados
  /*  const shipmentEve = await prisma.shipment.findFirst({
    where: { userId: userEve?.id as number },
  });
  const shipmentFabri = await prisma.shipment.findFirst({
    where: { userId: userFabri?.id as number },
  });

  // Crear la relación en ShipmentProduction
  await prisma.shipmentProduction.createMany({
    data: [
      {
        shipmentId: shipmentEve?.id as number, // ID del primer shipment
        productionId: productionLettuce?.id as number, // ID de la producción de lechuga
        initialQuantity: 100, // Cantidad total de la producción
        recivedQuantity: 80, // Cantidad recibida en el envío
        currentQuantity: 20, // Cantidad restante
      },
      {
        shipmentId: shipmentFabri?.id as number, // ID del segundo shipment
        productionId: productionTomato?.id as number, // ID de la producción de tomate
        initialQuantity: 200, // Cantidad total de la producción
        recivedQuantity: 150, // Cantidad recibida en el envío
        currentQuantity: 50, // Cantidad restante
      },
    ],
  }); */

  console.log("Finish seeding");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

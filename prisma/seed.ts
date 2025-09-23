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

const initialProducts: Omit<Product, "id">[] = [
  { code: "21011", name: "achicoria hoja ancha", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869436/q1d0uxmqan0v8o1n2jmt.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21021", name: "achicoria hoja fina", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339962/p5keuhcw3ptyglfn26gr.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11011", name: "ajenjo", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869821/fbqu31eydqtdcgvaur35.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12142", name: "ajenjo plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870239/d2l5khsgfzm0pbftlbre.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "23011", name: "aji picante", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870089/gx1t9nuwrokgnfmwuzk6.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "23052", name: "aji picante plantin", category: "hortalizas", type: "varios", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870313/gslczd5aflxyz7ytcvwh.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21031", name: "akusay", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869553/ciahpoh3sooq8n67fcih.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12011", name: "albahaca hidropónica", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 2300, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869918/dyxinigpzl4ukmh3eqdy.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12152", name: "albahaca plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869657/hoquy2nyzpdojoo1irfv.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11021", name: "azafran", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 3000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340360/gvtldo42yo2xwqeahpvo.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21041", name: "bamia", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340230/uqr8vzpyopqcwpx4ybqz.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "23021", name: "berenjena baby", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869500/trgajgmspvhhejizn9df.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21051", name: "berro", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870398/fdvwp1swsq0ecrxppdsm.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11031", name: "burro", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869849/t47air57k7tzby0ikf5c.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12162", name: "burro plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870436/gsmgfvgrsg0khizdlie1.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21061", name: "cardo", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870520/iwm0qcl9if1xeubjzrk9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11041", name: "cedron", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869835/n3jsb5lk5o0fer0jmcmb.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12021", name: "ciboulette", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 2500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339928/uubj43kdrywc9nnwumxv.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12172", name: "ciboulette plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870571/oyztjinhu5jyghnps7jn.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12031", name: "cilantro", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340004/ovyvvsqpbkwe1gjhfvkt.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12182", name: "cilantro plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870598/p7bdccjavfdbww7782h9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12041", name: "endeldo", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340129/jnnkuvwfcabvsebdv1vr.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21071", name: "escarola", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869716/z6tektlc5tv5xrbizopm.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21081", name: "espinaca", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870106/xwvhydg9kl4tabfdyefi.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12051", name: "estragon", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869945/dyjpazamizx84vpmsto9.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12061", name: "hierba buena", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339812/q4b7a1siwkduxsbdcxmj.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12192", name: "hierba buena plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870636/zm7l32dbgurra30w0knp.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12071", name: "huacatay", category: "aromaticas", type: "frescas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340311/idovlz8kbj3zltr2tkxj.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21091", name: "kale morado", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339897/eeaxp42pbhkhnbciicox.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21101", name: "kale verde", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339876/pv4ngrplpqmfbfufyriu.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "22011", name: "kreen", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: true, price: 3000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869281/kt6txkzx9tq8qm9idiux.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11061", name: "laurel", category: "aromaticas", type: "secas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869987/peqnn7ekbdkm3kboboug.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12081", name: "lemon grass", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 1500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340035/yjzsdzoj5ikxlaa6qumh.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11051", name: "malva", category: "aromaticas", type: "secas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870668/ygwckme2o9lio9y2mnqw.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12091", name: "menta", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339378/gxov8yisjnc1z1xucy7r.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12202", name: "menta plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339434/ssz8dhsua0luuzh3cznn.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12101", name: "oregano", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339549/wrt5gwou96rpdmjqoej3.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12212", name: "oregano plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339591/mypesthfhnhxdvrla7n9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21111", name: "pak choy", category: "hortalizas", type: "deHoja", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870153/sjbwey0onhm6rtlhhtib.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "11071", name: "peperina", category: "aromaticas", type: "secas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870719/q7qlwrro5wy4blnlizyb.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "23031", name: "pepinillo", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869335/x5flrjlysppn3jgvuj2w.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "22021", name: "rabano negro", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870755/hxylntl2fv8hx9llnj0z.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "22031", name: "rabano rojo", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869316/x3d3yoilnjdv1su632sy.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "22041", name: "radicchetta", category: "hortalizas", type: "Tuberculos y Raices", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870881/skskhn3gilki7y9hpo37.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21121", name: "radicchio", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 2000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869782/vlukgbp2y1mzyiw6qofc.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12111", name: "romero", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339468/wsv2zun8dxenhcvcssjb.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12222", name: "romero plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339513/krrw2uipvndbg35gj0e6.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "21131", name: "rucula", category: "hortalizas", type: "deHoja", presentation: "paquete", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339835/m8jfjtpp6wraaq6q0bvp.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12121", name: "salvia", category: "aromaticas", type: "frescas", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869462/zhkhsxlyosevmhyoqj17.png`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12232", name: "salvia plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870929/b0zcgzlamphxt0u0ec9g.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12131", name: "tomillo", category: "aromaticas", type: "frescas", presentation: "paquete", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339775/mn9ueglv4zadyo3hteiz.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "12242", name: "tomillo plantin", category: "aromaticas", type: "frescas", presentation: "plantin", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870967/vkjpkwjtshieidujzjg5.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { code: "23041", name: "zuccini amarillo", category: "hortalizas", type: "varios", presentation: "paquete", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757871014/uyrlr4xsypaxqmgt7myb.jpg`, createdAt: new Date(), updatedAt: new Date() },
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

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
  { id: 1, code: "001", name: "Achicoria hoja ancha", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, code: "002", name: "Achicoria hoja fina", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339962/p5keuhcw3ptyglfn26gr.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, code: "003", name: "Ajenjo", active: true, price: 500, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, code: "004", name: "Ajenjo (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, code: "005", name: "Aji picante", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, code: "006", name: "Aji picante (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 7, code: "007", name: "Akusay", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 8, code: "008", name: "Albahaca hidropónica", active: true, price: 2300, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 9, code: "009", name: "Albahaca (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 10, code: "010", name: "Azafran", active: true, price: 3000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340360/gvtldo42yo2xwqeahpvo.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 11, code: "011", name: "Bamia", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340230/uqr8vzpyopqcwpx4ybqz.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 12, code: "012", name: "Berenjena baby", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 13, code: "013", name: "Berro", active: true, price: 1500, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 14, code: "014", name: "Burro", active: true, price: 667, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 15, code: "015", name: "Burro (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 16, code: "016", name: "Cardo", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 17, code: "017", name: "Cedron", active: true, price: 667, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 18, code: "018", name: "Ciboulette", active: true, price: 2500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339928/uubj43kdrywc9nnwumxv.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 19, code: "019", name: "Ciboulette (Plantin)", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 20, code: "020", name: "Cilantro", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340004/ovyvvsqpbkwe1gjhfvkt.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 21, code: "021", name: "Cilantro (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 22, code: "022", name: "Eneldo", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340129/jnnkuvwfcabvsebdv1vr.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 23, code: "023", name: "Escarola", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 24, code: "024", name: "Espinaca", active: true, price: 667, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 25, code: "025", name: "Estragon", active: true, price: 500, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 26, code: "026", name: "Hierba buena", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339812/q4b7a1siwkduxsbdcxmj.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 27, code: "027", name: "Hierba buena (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 28, code: "028", name: "Huacatay", active: false, price: 0, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340311/idovlz8kbj3zltr2tkxj.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 29, code: "029", name: "Kale morado", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339897/eeaxp42pbhkhnbciicox.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 30, code: "030", name: "Kale verde", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339876/pv4ngrplpqmfbfufyriu.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 31, code: "031", name: "Kreen", active: true, price: 3000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 32, code: "032", name: "Laurel", active: true, price: 667, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 33, code: "033", name: "Lemon Grass", active: true, price: 1500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340035/yjzsdzoj5ikxlaa6qumh.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 34, code: "034", name: "Malva", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 35, code: "035", name: "Menta", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339378/gxov8yisjnc1z1xucy7r.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 36, code: "036", name: "Menta (Plantin)", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339434/ssz8dhsua0luuzh3cznn.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 37, code: "037", name: "Oregano", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339549/wrt5gwou96rpdmjqoej3.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 38, code: "038", name: "Oregano (Plantin)", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339591/mypesthfhnhxdvrla7n9.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 39, code: "039", name: "Pak choy", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 40, code: "040", name: "Peperina", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 41, code: "041", name: "Pepinillo", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 42, code: "042", name: "Rabano negro", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 43, code: "043", name: "Rabano rojo", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 44, code: "044", name: "Radicchetta", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 45, code: "045", name: "Radicchio", active: true, price: 2000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 46, code: "046", name: "Romero", active: true, price: 500, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339468/wsv2zun8dxenhcvcssjb.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 47, code: "047", name: "Romero (Plantin)", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339513/krrw2uipvndbg35gj0e6.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 48, code: "048", name: "Rucula", active: true, price: 1000, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339835/m8jfjtpp6wraaq6q0bvp.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 49, code: "049", name: "Salvia", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 50, code: "050", name: "Salvia (Plantin)", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 51, code: "051", name: "Tomillo", active: true, price: 667, image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339775/mn9ueglv4zadyo3hteiz.jpg`, createdAt: new Date(), updatedAt: new Date() },
  { id: 52, code: "052", name: "Tomillo (Plantin)", active: true, price: 1000, image: ``, createdAt: new Date(), updatedAt: new Date() },
  { id: 53, code: "053", name: "Zuccini amarillo", active: false, price: 0, image: ``, createdAt: new Date(), updatedAt: new Date() },
];


async function main() {
  console.log("Start seeding...");

  // Eliminar registros existentes
  /*   await prisma.shipmentProduction.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.production.deleteMany(); */
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

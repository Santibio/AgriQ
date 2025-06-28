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
  {
    id: 1,
    code: "001",
    name: "lechuga",
    active: true,
    price: 100,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324325/tpaofrarv6lcw2ahnbzl.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    code: "002",
    name: "tomate",
    active: true,
    price: 120,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324326/mhsrhwlkr4s3zv8tmiss.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    code: "003",
    name: "papa",
    active: true,
    price: 80,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324325/skxg67laz7kk21ag70g9.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    code: "004",
    name: "zanahoria",
    active: true,
    price: 90,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324325/muzep6wexjsgmhdoficj.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    code: "005",
    name: "cebolla",
    active: true,
    price: 70,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324325/w29nmrto31z7nk2ydrlt.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    code: "006",
    name: "menta",
    active: true,
    price: 110,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324325/dbtyadni9jnfzsgyiwee.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    code: "007",
    name: "acelga",
    active: true,
    price: 95,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730324325/eqlmib8p1ddglsh5szeb.jpg`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
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

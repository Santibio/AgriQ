import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialUsers = [
  {
    username: "eve.perez",
    password: "eve@prisma.io",
    role: "administrator",
    name: "Eve",
    lastName: "Perez",
    avatar: "/images/avatars/eve.perez.jpg",
    active: true,
  },
  {
    username: "fabri.perez",
    password: "fabri@prisma.io",
    role: "sells",
    name: "Fabri",
    lastName: "Perez",
    avatar: "/images/avatars/fabri.perez.jpg",
    active: true,
  },
  {
    username: "santiago.perez",
    password: "santiago@prisma.io",
    role: "administrator",
    name: "Santiago",
    lastName: "Perez",
    avatar: "/images/avatars/santiago.perez.jpg",
    active: true,
  },
];

const initialProducts = [
  {
    code: "001",
    name: "lechuga",
    image: "/images/products/lettuce.jpg",
  },
  {
    code: "002",
    name: "tomate",
    image: "/images/products/tomato.jpg",
  },
  {
    code: "003",
    name: "papa",
    image: "/images/products/potato.jpg",
  },
  {
    code: "004",
    name: "zanahoria",
    image: "/images/products/carrot.jpg",
  },
  {
    code: "005",
    name: "cebolla",
    image: "/images/products/onion.jpg",
  },
  {
    code: "006",
    name: "menta",
    image: "/images/products/mint.jpg",
  },
  {
    code: "007",
    name: "acelga",
    image: "/images/products/chard.jpg",
  },
];

async function main() {
  console.log("Start seeding...");

  // Eliminar registros existentes
  await prisma.shipmentProduction.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.production.deleteMany();
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
  const userEve = await prisma.user.findFirst({
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
  });

  // Crear producciones
  await prisma.production.createMany({
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
  });

  // Obtener los IDs de las producciones recién creadas
  const productionLettuce = await prisma.production.findFirst({
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
  });

  // Crear envíos
  await prisma.shipment.createMany({
    data: [
      {
        userId: userEve?.id as number, // ID del usuario Eve
      },
      {
        userId: userFabri?.id as number, // ID del usuario Fabri
      },
    ],
  });

  // Obtener los IDs de los envíos recién creados
  const shipmentEve = await prisma.shipment.findFirst({
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
  });

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

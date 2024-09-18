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
  },
  {
    username: "fabri.perez",
    password: "fabri@prisma.io",
    role: "sells",
    name: "Fabri",
    lastName: "Perez",
    avatar: "/images/avatars/fabri.perez.jpg",
  },
  {
    username: "santiago.perez",
    password: "santiago@prisma.io",
    role: "deposit",
    name: "Santiago",
    lastName: "Perez",
    avatar: "/images/avatars/santiago.perez.jpg",
  },
];

const intialProducts = [
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
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: initialUsers,
  });
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: intialProducts,
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

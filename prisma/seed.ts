/* eslint-disable @typescript-eslint/no-shadow */
import {
  Batch,
  CancelReason,
  Customer,
  FiscalCondition,
  Location,
  MovementType,
  PaymentMethod,
  PrismaClient,
  Product,
  Role,
  ShipmentStatus,
  StatusDoing,
  StatusPayment,
  User,
} from '@prisma/client'

const prisma = new PrismaClient()

// --- CONFIGURACIÓN DE LA SIMULACIÓN ---
const NUM_ORDERS_PER_MONTH = 50
const NUM_CANCELLED_ORDERS = 15
// Usamos una fecha fija para que el seed sea repetible
const SIM_TODAY = new Date()

// --- DATOS INICIALES (Usuarios, Clientes, Productos) ---
// (Pega aquí tus arrays 'initialUsers', 'initialProducts', e 'initialCustomers')
const initialUsers = [
  {
    username: 'admin',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.ADMIN,
    name: 'Sistema',
    lastName: 'Usuario',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761426713/mkzx9zyifpb0tkx6o8kb.jpg`,
    active: true,
  },
  {
    username: 'carolina.perez',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.SELLER,
    name: 'Carolina',
    lastName: 'Perez',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761426713/mkzx9zyifpb0tkx6o8kb.jpg`,
    active: true,
  },
  {
    username: 'yanina.perez',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.DEPOSIT,
    name: 'Yanina',
    lastName: 'Perez',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761426713/mkzx9zyifpb0tkx6o8kb.jpg`,
    active: true,
  },
  {
    username: 'juan.perez',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.ADMIN,
    name: 'Juan',
    lastName: 'Perez',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761426713/mkzx9zyifpb0tkx6o8kb.jpg`,
    active: true,
  },
]

const initialProducts = [
  {
    code: '21011',
    name: 'achicoria hoja ancha',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869436/q1d0uxmqan0v8o1n2jmt.png`,
  },
  {
    code: '21021',
    name: 'achicoria hoja fina',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339962/p5keuhcw3ptyglfn26gr.jpg`,
  },
  {
    code: '11011',
    name: 'ajenjo',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: true,
    price: 500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869821/fbqu31eydqtdcgvaur35.png`,
  },
  {
    code: '12142',
    name: 'ajenjo plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870239/d2l5khsgfzm0pbftlbre.jpg`,
  },
  {
    code: '23011',
    name: 'aji picante',
    category: 'hortalizas',
    type: 'varios',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870089/gx1t9nuwrokgnfmwuzk6.png`,
  },
  {
    code: '23052',
    name: 'aji picante plantin',
    category: 'hortalizas',
    type: 'varios',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870313/gslczd5aflxyz7ytcvwh.jpg`,
  },
  {
    code: '21031',
    name: 'akusay',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869553/ciahpoh3sooq8n67fcih.png`,
  },
  {
    code: '12011',
    name: 'albahaca hidropónica',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 2300,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869918/dyxinigpzl4ukmh3eqdy.png`,
  },
  {
    code: '12152',
    name: 'albahaca plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869657/hoquy2nyzpdojoo1irfv.png`,
  },
  {
    code: '11021',
    name: 'azafran',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: true,
    price: 3000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340360/gvtldo42yo2xwqeahpvo.jpg`,
  },
  {
    code: '21041',
    name: 'bamia',
    category: 'hortalizas',
    type: 'varios',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340230/uqr8vzpyopqcwpx4ybqz.jpg`,
  },
  {
    code: '23021',
    name: 'berenjena baby',
    category: 'hortalizas',
    type: 'varios',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869500/trgajgmspvhhejizn9df.png`,
  },
  {
    code: '21051',
    name: 'berro',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 1500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870398/fdvwp1swsq0ecrxppdsm.jpg`,
  },
  {
    code: '11031',
    name: 'burro',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869849/t47air57k7tzby0ikf5c.png`,
  },
  {
    code: '12162',
    name: 'burro plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870436/gsmgfvgrsg0khizdlie1.jpg`,
  },
  {
    code: '21061',
    name: 'cardo',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870520/iwm0qcl9if1xeubjzrk9.jpg`,
  },
  {
    code: '11041',
    name: 'cedron',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869835/n3jsb5lk5o0fer0jmcmb.png`,
  },
  {
    code: '12021',
    name: 'ciboulette',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 2500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339928/uubj43kdrywc9nnwumxv.jpg`,
  },
  {
    code: '12172',
    name: 'ciboulette plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870571/oyztjinhu5jyghnps7jn.png`,
  },
  {
    code: '12031',
    name: 'cilantro',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340004/ovyvvsqpbkwe1gjhfvkt.jpg`,
  },
  {
    code: '12182',
    name: 'cilantro plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870598/p7bdccjavfdbww7782h9.jpg`,
  },
  {
    code: '12041',
    name: 'eneldo',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340129/jnnkuvwfcabvsebdv1vr.jpg`,
  },
  {
    code: '21071',
    name: 'escarola',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869716/z6tektlc5tv5xrbizopm.png`,
  },
  {
    code: '21081',
    name: 'espinaca',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870106/xwvhydg9kl4tabfdyefi.png`,
  },
  {
    code: '12051',
    name: 'estragon',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869945/dyjpazamizx84vpmsto9.png`,
  },
  {
    code: '12061',
    name: 'hierba buena',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339812/q4b7a1siwkduxsbdcxmj.jpg`,
  },
  {
    code: '12192',
    name: 'hierba buena plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870636/zm7l32dbgurra30w0knp.jpg`,
  },
  {
    code: '12071',
    name: 'huacatay',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340311/idovlz8kbj3zltr2tkxj.jpg`,
  },
  {
    code: '21091',
    name: 'kale morado',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339897/eeaxp42pbhkhnbciicox.jpg`,
  },
  {
    code: '21101',
    name: 'kale verde',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339876/pv4ngrplpqmfbfufyriu.jpg`,
  },
  {
    code: '22011',
    name: 'kreen',
    category: 'hortalizas',
    type: 'tuberculosRaices',
    presentation: 'paquete',
    active: true,
    price: 3000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869281/kt6txkzx9tq8qm9idiux.png`,
  },
  {
    code: '11061',
    name: 'laurel',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869987/peqnn7ekbdkm3kboboug.png`,
  },
  {
    code: '12081',
    name: 'lemon grass',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 1500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730340035/yjzsdzoj5ikxlaa6qumh.jpg`,
  },
  {
    code: '11051',
    name: 'malva',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870668/ygwckme2o9lio9y2mnqw.jpg`,
  },
  {
    code: '12091',
    name: 'menta',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339378/gxov8yisjnc1z1xucy7r.jpg`,
  },
  {
    code: '12202',
    name: 'menta plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339434/ssz8dhsua0luuzh3cznn.jpg`,
  },
  {
    code: '12101',
    name: 'oregano',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339549/wrt5gwou96rpdmjqoej3.jpg`,
  },
  {
    code: '12212',
    name: 'oregano plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339591/mypesthfhnhxdvrla7n9.jpg`,
  },
  {
    code: '21111',
    name: 'pak choy',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870153/sjbwey0onhm6rtlhhtib.png`,
  },
  {
    code: '11071',
    name: 'peperina',
    category: 'aromaticas',
    type: 'secas',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870719/q7qlwrro5wy4blnlizyb.jpg`,
  },
  {
    code: '23031',
    name: 'pepinillo',
    category: 'hortalizas',
    type: 'varios',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869335/x5flrjlysppn3jgvuj2w.png`,
  },
  {
    code: '22021',
    name: 'rabano negro',
    category: 'hortalizas',
    type: 'tuberculosRaices',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870755/hxylntl2fv8hx9llnj0z.jpg`,
  },
  {
    code: '22031',
    name: 'rabano rojo',
    category: 'hortalizas',
    type: 'tuberculosRaices',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869316/x3d3yoilnjdv1su632sy.png`,
  },
  {
    code: '22041',
    name: 'radicchetta',
    category: 'hortalizas',
    type: 'tuberculosRaices',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870881/skskhn3gilki7y9hpo37.jpg`,
  },
  {
    code: '21121',
    name: 'radicchio',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 2000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869782/vlukgbp2y1mzyiw6qofc.jpg`,
  },
  {
    code: '12111',
    name: 'romero',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 500,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339468/wsv2zun8dxenhcvcssjb.jpg`,
  },
  {
    code: '12222',
    name: 'romero plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339513/krrw2uipvndbg35gj0e6.jpg`,
  },
  {
    code: '21131',
    name: 'rucula',
    category: 'hortalizas',
    type: 'deHoja',
    presentation: 'paquete',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339835/m8jfjtpp6wraaq6q0bvp.jpg`,
  },
  {
    code: '12121',
    name: 'salvia',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757869462/zhkhsxlyosevmhyoqj17.png`,
  },
  {
    code: '12232',
    name: 'salvia plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870929/b0zcgzlamphxt0u0ec9g.jpg`,
  },
  {
    code: '12131',
    name: 'tomillo',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'paquete',
    active: true,
    price: 667,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1730339775/mn9ueglv4zadyo3hteiz.jpg`,
  },
  {
    code: '12242',
    name: 'tomillo plantin',
    category: 'aromaticas',
    type: 'frescas',
    presentation: 'plantin',
    active: true,
    price: 1000,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757870967/vkjpkwjtshieidujzjg5.jpg`,
  },
  {
    code: '23041',
    name: 'zuccini amarillo',
    category: 'hortalizas',
    type: 'varios',
    presentation: 'paquete',
    active: false,
    price: 0,
    image: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1757871014/uyrlr4xsypaxqmgt7myb.jpg`,
  },
]

const initialCustomers = [
  {
    name: 'Juan',
    lastName: 'Pérez',
    phone: '+549111234567',
    email: 'juan.perez@example.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE, // <-- Usando tu enum
  },
  {
    name: 'María',
    lastName: 'González',
    phone: '+549351765432',
    email: 'maria.gonzalez@example.com',
    fiscalCondition: FiscalCondition.MONOTAX, // <-- Usando tu enum
  },
  {
    name: 'Carlos',
    lastName: 'Rodríguez',
    phone: '+549221987654',
    email: 'carlos.r@example.com',
    fiscalCondition: FiscalCondition.FINAL_CONSUMER, // <-- Usando tu enum
  },
  {
    name: 'Ana',
    lastName: 'Martínez',
    phone: '+549261456789',
    email: 'ana.martinez@example.com',
    fiscalCondition: FiscalCondition.MONOTAX,
    active: false, // Sobreescribimos el default
  },
  {
    name: 'Empresa',
    lastName: 'Exenta S.A.',
    phone: '+549115555444',
    email: 'compras@exenta.com',
    fiscalCondition: FiscalCondition.EXEMPT, // <-- Usando tu enum
  },
]

// --- FIN DE DATOS INICIALES ---

// --- FUNCIONES HELPERS ---

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Genera una fecha aleatoria dentro de un rango */
function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
}

/** Suma minutos a una fecha */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

// --- FUNCIONES DE TRANSACCIONES (Modificadas para aceptar fecha) ---

/** T1: Crea un lote de stock inicial en DEPOSIT */
async function createStock(
  prisma: PrismaClient,
  {
    productId,
    userId,
    quantity,
    code,
    date,
  }: {
    productId: number
    userId: number
    quantity: number
    code: string
    date: Date // <-- Parámetro de fecha
  },
) {
  return prisma.$transaction(async tx => {
    const batch = await tx.batch.create({
      data: {
        code,
        initialQuantity: quantity,
        depositQuantity: quantity,
        productId: productId,
        createdAt: date, // <-- Sobrescritura de fecha
        updatedAt: date, // <-- Sobrescritura de fecha
      },
    })
    const movement = await tx.movement.create({
      data: {
        userId: userId,
        type: MovementType.STORED,
        createdAt: date, // <-- Sobrescritura de fecha
      },
    })
    await tx.movementDetail.create({
      data: { movementId: movement.id, batchId: batch.id, quantity: quantity },
    })
    return batch
  })
}

/** T2: Envía (SENT) e Inmediatamente Recibe (RECEIVED_MARKET) stock */
async function shipAndReceive(
  prisma: PrismaClient,
  {
    batch,
    depositUserId,
    sellerUserId,
    quantity,
    date,
  }: {
    batch: Batch
    depositUserId: number
    sellerUserId: number
    quantity: number
    date: Date // <-- Parámetro de fecha
  },
) {
  const sentDate = date
  const receivedDate = addMinutes(date, 5) // 5 minutos después

  return prisma.$transaction(async tx => {
    // 1. Envío (SENT)
    const sentMovement = await tx.movement.create({
      data: {
        userId: depositUserId,
        type: MovementType.SENT,
        createdAt: sentDate,
      },
    })
    const shipment = await tx.shipment.create({
      data: {
        movementId: sentMovement.id,
        status: ShipmentStatus.PENDING,
        origin: Location.DEPOSIT,
        destination: Location.MARKET,
        createdAt: sentDate,
        updatedAt: sentDate,
      },
    })
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        depositQuantity: { decrement: quantity },
        sentQuantity: { increment: quantity },
        updatedAt: sentDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: sentMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })

    // 2. Recepción (RECEIVED_MARKET) - 5 mins después
    await tx.shipment.update({
      where: { id: shipment.id },
      data: { status: ShipmentStatus.RECEIVED_OK, updatedAt: receivedDate },
    })
    const updatedBatch = await tx.batch.update({
      where: { id: batch.id },
      data: {
        sentQuantity: { decrement: quantity },
        marketQuantity: { increment: quantity },
        receivedQuantity: { increment: quantity },
        updatedAt: receivedDate,
      },
    })
    const recMovement = await tx.movement.create({
      data: {
        userId: sellerUserId,
        type: MovementType.RECEIVED_MARKET,
        createdAt: receivedDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: recMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })
    return updatedBatch
  })
}

/** T3: Simula el flujo completo de una venta: Pide, Cobra y Entrega */
async function createFullOrderFlow(
  prisma: PrismaClient,
  {
    customer,
    seller,
    batch,
    product,
    quantity,
    date,
  }: {
    customer: Customer
    seller: User
    batch: Batch
    product: Product
    quantity: number
    date: Date // <-- Parámetro de fecha
  },
) {
  // Simulamos el flujo en el tiempo
  const orderDate = date
  const saleDate = addMinutes(orderDate, getRandomInt(5, 60 * 24)) // 5m a 1 día después
  const deliveryDate = addMinutes(saleDate, getRandomInt(5, 60 * 8)) // 5m a 8hs después

  return prisma.$transaction(async tx => {
    const total = product.price * quantity

    // 1. Crear Pedido (ORDERED)
    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        statusDoing: StatusDoing.PENDING,
        statusPayment: StatusPayment.UNPAID,
        total: total,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    })
    await tx.orderDetail.create({
      data: {
        orderId: order.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    })
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        marketQuantity: { decrement: quantity },
        reservedQuantity: { increment: quantity },
        updatedAt: orderDate,
      },
    })
    const orderMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.ORDERED,
        orderId: order.id,
        createdAt: orderDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: orderMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })

    // 2. Cobrar Pedido (SOLD)
    await tx.order.update({
      where: { id: order.id },
      data: {
        statusDoing: StatusDoing.READY_TO_DELIVER,
        statusPayment: StatusPayment.PAID,
        updatedAt: saleDate,
      },
    })
    const saleMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.SOLD,
        orderId: order.id,
        createdAt: saleDate,
      },
    })
    await tx.sale.create({
      data: {
        orderId: order.id,
        movementId: saleMovement.id,
        paymentMethod: getRandomElement([
          PaymentMethod.CASH,
          PaymentMethod.WIRE,
        ]),
        paymentReceipt: `RECIBO-SEED-${order.id}`,
        discount: 0,
        subtotal: total,
        total: total,
        createdAt: saleDate,
        updatedAt: saleDate,
      },
    })
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        reservedQuantity: { decrement: quantity },
        soltQuantity: { increment: quantity },
        updatedAt: saleDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: saleMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })

    // 3. Entregar Pedido (DELIVERED)
    await tx.order.update({
      where: { id: order.id },
      data: { statusDoing: StatusDoing.DELIVERED, updatedAt: deliveryDate },
    })
    const delMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.DELIVERED,
        orderId: order.id,
        createdAt: deliveryDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: delMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })

    return order
  })
}

/** T4: Crea un pedido PENDIENTE (sin cobrar ni vender) */
async function createPendingOrder(
  prisma: PrismaClient,
  {
    customer,
    seller,
    batch,
    product,
    quantity,
    date,
  }: {
    customer: Customer
    seller: User
    batch: Batch
    product: Product
    quantity: number
    date: Date
  },
) {
  return prisma.$transaction(async tx => {
    const total = product.price * quantity
    // 1. Crear Pedido (ORDERED)
    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        statusDoing: StatusDoing.PENDING,
        statusPayment: StatusPayment.UNPAID,
        total: total,
        createdAt: date,
        updatedAt: date,
      },
    })
    await tx.orderDetail.create({
      data: {
        orderId: order.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        createdAt: date,
        updatedAt: date,
      },
    })
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        marketQuantity: { decrement: quantity },
        reservedQuantity: { increment: quantity },
        updatedAt: date,
      },
    })
    const orderMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.ORDERED,
        orderId: order.id,
        createdAt: date,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: orderMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })
    return order
  })
}

/** T5: Crea un pedido CANCELADO (y devuelve el stock) */
async function createCancelledOrder(
  prisma: PrismaClient,
  {
    customer,
    seller,
    batch,
    product,
    quantity,
    date,
  }: {
    customer: Customer
    seller: User
    batch: Batch
    product: Product
    quantity: number
    date: Date
  },
) {
  const orderDate = date
  const cancelDate = addMinutes(orderDate, getRandomInt(10, 60 * 24)) // 10m a 1 día después

  return prisma.$transaction(async tx => {
    const total = product.price * quantity
    // 1. Crear Pedido (ORDERED) y Reservar
    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        statusDoing: StatusDoing.PENDING,
        statusPayment: StatusPayment.UNPAID,
        total: total,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    })
    // ... (detalle y movimiento de reserva omitidos por brevedad, pero necesarios)
    await tx.orderDetail.create({
      data: {
        orderId: order.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    })
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        marketQuantity: { decrement: quantity },
        reservedQuantity: { increment: quantity },
        updatedAt: orderDate,
      },
    })
    const orderMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.ORDERED,
        orderId: order.id,
        createdAt: orderDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: orderMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })

    // 2. Cancelar Pedido (CANCELLED) y Devolver stock
    await tx.order.update({
      where: { id: order.id },
      data: {
        statusDoing: StatusDoing.CANCELLED,
        statusPayment: StatusPayment.CANCELLED,
        cancelReason: CancelReason.CUSTOMER_REQUEST, // Razón de cancelación
        updatedAt: cancelDate,
      },
    })
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        reservedQuantity: { decrement: quantity }, // Sale de reservado
        marketQuantity: { increment: quantity }, // Vuelve a mercado
        updatedAt: cancelDate,
      },
    })
    const cancelMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.CANCELLED,
        orderId: order.id,
        createdAt: cancelDate,
      },
    })
    await tx.movementDetail.create({
      data: {
        movementId: cancelMovement.id,
        batchId: batch.id,
        quantity: quantity,
      },
    })
    return order
  })
}

// --- FUNCIÓN PRINCIPAL DEL SEED ---

async function main() {
  console.log('Start seeding...')
  console.log(`Simulando hasta la fecha: ${SIM_TODAY.toISOString()}`)

  console.log('Deleting existing records...')
  // (Mismo orden de borrado que antes)
  await prisma.movementDetail.deleteMany()
  await prisma.discard.deleteMany()
  await prisma.orderDetail.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.movement.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()

  // --- 1. Crear Modelos Simples ---
  console.log('Creating simple models (Users, Products, Customers)...')
  await prisma.user.createMany({ data: initialUsers })
  await prisma.product.createMany({ data: initialProducts })
  await prisma.customer.createMany({ data: initialCustomers })

  // --- 2. Obtener IDs para Relaciones ---
  console.log('Fetching created models for relations...')
  const users = await prisma.user.findMany()
  const products = await prisma.product.findMany({ where: { active: true } })
  const customers = await prisma.customer.findMany({ where: { active: true } })

  const depositUser = users.find(u => u.role === Role.DEPOSIT)
  const sellerUser = users.find(u => u.role === Role.SELLER)

  if (!depositUser || !sellerUser) {
    throw new Error('Faltan los usuarios DEPOSIT o SELLER')
  }

  // --- 3. Generar Stock (Lotes) y Moverlos al Mercado ---
  // (Todo esto sucede en el "pasado", hace 12-11 meses)
  const oneYearAgo = new Date(SIM_TODAY)
  oneYearAgo.setFullYear(SIM_TODAY.getFullYear() - 1) // 21 Oct 2024

  const elevenMonthsAgo = new Date(oneYearAgo)
  elevenMonthsAgo.setMonth(oneYearAgo.getMonth() + 1) // 21 Nov 2024

  console.log('Generating initial stock (Batches) in the past (1 year ago)...')
  let batchCounter = 1
  for (const product of products) {
    const batchesToCreate = getRandomInt(2, 5) // Más lotes
    for (let i = 0; i < batchesToCreate; i++) {
      const stockDate = getRandomDate(oneYearAgo, elevenMonthsAgo)
      const quantity = getRandomInt(200, 1000)

      // 1. Crear Lote
      const batch = await createStock(prisma, {
        productId: product.id,
        userId: depositUser.id,
        quantity: quantity,
        code: `LOTE-${product.code}-${batchCounter++}`,
        date: stockDate,
      })

      // 2. Mover la mayoría al mercado
      const quantityToShip = Math.floor(quantity * 0.8) // Mover 80%
      const shipDate = addMinutes(stockDate, 60) // 1 hora después

      await shipAndReceive(prisma, {
        batch: batch,
        depositUserId: depositUser.id,
        sellerUserId: sellerUser.id,
        quantity: quantityToShip,
        date: shipDate,
      })
    }
  }
  console.log(' -> Finished creating and shipping initial stock.')

  // --- 4. Generar Pedidos Históricos (Mes a Mes) ---
  console.log(
    `Generating ${NUM_ORDERS_PER_MONTH} orders per month for 12 months...`,
  )

  const monthStart = new Date(oneYearAgo)

  for (let month = 0; month < 12; month++) {
    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthStart.getMonth() + 1)

    // Evitar crear pedidos en el "futuro"
    if (monthEnd > SIM_TODAY) break

    console.log(
      ` -> Simulating Month ${month + 1}/${12} (${
        monthStart.toISOString().split('T')[0]
      })`,
    )

    // Obtenemos lotes CON STOCK en el mercado
    let availableBatches = await prisma.batch.findMany({
      where: { marketQuantity: { gt: 10 } }, // Dejar un colchón
      include: { product: true },
    })

    if (availableBatches.length === 0) {
      console.warn(` -> No stock available for Month ${month + 1}. Skipping.`)
      monthStart.setMonth(monthStart.getMonth() + 1) // Avanzar al siguiente mes
      continue
    }

    const orderPromises = []
    for (let i = 0; i < NUM_ORDERS_PER_MONTH; i++) {
      const randomBatch = getRandomElement(availableBatches)
      const randomCustomer = getRandomElement(customers)
      const randomDate = getRandomDate(monthStart, monthEnd)
      let quantityToOrder = getRandomInt(1, 5)

      if (quantityToOrder > randomBatch.marketQuantity) {
        quantityToOrder = randomBatch.marketQuantity
      }

      if (quantityToOrder > 0) {
        orderPromises.push(
          createFullOrderFlow(prisma, {
            customer: randomCustomer,
            seller: sellerUser,
            batch: randomBatch,
            product: randomBatch.product,
            quantity: quantityToOrder,
            date: randomDate,
          }),
        )
        // Actualización "optimista" del stock local para evitar sobre-vender
        randomBatch.marketQuantity -= quantityToOrder
        // Si el lote se agota, sacarlo de la lista
        if (randomBatch.marketQuantity <= 10) {
          availableBatches = availableBatches.filter(
            b => b.id !== randomBatch.id,
          )
          if (availableBatches.length === 0) break // Salir si no hay más stock
        }
      }
    }

    try {
      await Promise.all(orderPromises)
    } catch (error) {
      console.error(
        ` -> Error creating orders for Month ${month + 1}: `,
        (error as Error).message,
      )
    }

    monthStart.setMonth(monthStart.getMonth() + 1) // Avanzar al siguiente mes
  }

  console.log('Finished generating historical orders.')

  // --- 5. Generar Órdenes Especiales (Hoy y Canceladas) ---

  // Obtenemos los últimos lotes con stock
  const finalAvailableBatches = await prisma.batch.findMany({
    where: { marketQuantity: { gt: 5 } },
    include: { product: true },
  })

  if (finalAvailableBatches.length > 0) {
    // 5a. Crear Órdenes Canceladas (en la última semana)
    console.log(`Creating ${NUM_CANCELLED_ORDERS} cancelled orders...`)
    const oneWeekAgo = new Date(SIM_TODAY)
    oneWeekAgo.setDate(SIM_TODAY.getDate() - 7)

    const cancelledPromises = []
    for (let i = 0; i < NUM_CANCELLED_ORDERS; i++) {
      const randomBatch = getRandomElement(finalAvailableBatches)
      const randomCustomer = getRandomElement(customers)
      const randomDate = getRandomDate(oneWeekAgo, SIM_TODAY)
      const quantity = 1

      // Asegurarnos que el stock no fue "optimistamente" reducido
      const realBatch = await prisma.batch.findUnique({
        where: { id: randomBatch.id },
      })
      if (realBatch && realBatch.marketQuantity > quantity) {
        cancelledPromises.push(
          createCancelledOrder(prisma, {
            customer: randomCustomer,
            seller: sellerUser,
            batch: realBatch,
            product: randomBatch.product,
            quantity: quantity,
            date: randomDate,
          }),
        )
      }
    }
    await Promise.all(cancelledPromises)
    console.log(` -> ${cancelledPromises.length} cancelled orders created.`)

    // 5b. Crear la Orden Pendiente de HOY
    console.log('Creating one PENDING order for today...')
    const todayBatch = getRandomElement(finalAvailableBatches)
    const todayCustomer = getRandomElement(customers)

    const realTodayBatch = await prisma.batch.findUnique({
      where: { id: todayBatch.id },
    })

    if (realTodayBatch && realTodayBatch.marketQuantity > 0) {
      const order = await createPendingOrder(prisma, {
        customer: todayCustomer,
        seller: sellerUser,
        batch: realTodayBatch,
        product: todayBatch.product,
        quantity: 1,
        date: SIM_TODAY, // Exactamente hoy
      })
      console.log(
        ` -> Created PENDING order #${order.id} for today (not paid, not sold).`,
      )
    } else {
      console.log(" -> Skipped creating today's order, no stock left.")
    }
  } else {
    console.warn(' -> Skipped special orders, no available stock found.')
  }

  console.log('Finish seeding. ✅')
}

// --- EJECUCIÓN DEL SCRIPT ---

main()
  .catch(async e => {
    console.error('Error during seeding: ', e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

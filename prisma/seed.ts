/* eslint-disable @typescript-eslint/no-shadow */
import {
  Batch,
  Customer,
  DiscardReason,
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

// --- CONFIGURACIÓN MANUAL POR MES ---

// 1. Elige la fecha que quieres cargar (Ej: Noviembre 2024)
const MES_A_CARGAR = 11 // 1 = Enero, ..., 11 = Noviembre, 12 = Diciembre
const ANIO_A_CARGAR = 2025

// 2. ¿Quieres borrar toda la DB antes de empezar?
// Pon TRUE si es el primer mes que cargas.
// Pon FALSE si quieres sumar este mes a los datos anteriores.
const LIMPIAR_DB = true

// 3. Configuración de Cantidades (Tus requisitos)
const NUM_ORDERS_PER_MONTH = 200 // 480 pedidos completados
const NUM_DISCARDS_PER_MONTH = 20 // 20 movimientos de descarte
const TOTAL_BATCH_STOCK_IN_MONTH = 25 // 200 unidades (lotes) de entrada
const MAX_BATCH_SIZE = 50
const NUM_DAYS_IN_MONTH_SIM = 20

// Fecha de referencia para validaciones (Hoy)
const SIM_TODAY = new Date()

// --- FIN DE CONFIGURACIÓN ---

// --- DATOS INICIALES (Usuarios, Clientes, Productos) ---
const initialUsers = [
  {
    username: 'admin',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.ADMIN,
    name: 'Administrador',
    lastName: 'Del Sistema',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761426713/mkzx9zyifpb0tkx6o8kb.jpg`,
    active: true,
  },
  {
    username: 'carolina.perez',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.SELLER,
    name: 'Carolina',
    lastName: 'Perez',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761428728/xnjn8yq9nphlfxdyl3ak.jpg`,
    active: true,
  },
  {
    username: 'yanina.perez',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.DEPOSIT,
    name: 'Yanina',
    lastName: 'Perez',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761428800/cauhdemrbyvvgptkqly8.jpg`,
    active: true,
  },
  {
    username: 'juan.perez',
    password: '$2a$10$MEqVIIYuSGvLW6gP.IEB.euAVVd7TzE8zN.4g8c88tw5ugN/FGxdW', // Tesis.2025
    role: Role.ADMIN,
    name: 'Juan',
    lastName: 'Perez',
    avatar: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v1761428877/cbz8jm4h76qhnel4tqhy.jpg`,
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
  // --- Clientes Originales ---
  {
    name: 'Juan',
    lastName: 'Martinez',
    phone: '+549111234567', // 13 caracteres OK
    email: 'juan.martinez@example.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },
  {
    name: 'María',
    lastName: 'González',
    phone: '+549351765432', // 13 caracteres OK
    email: 'maria.gonzalez@example.com',
    fiscalCondition: FiscalCondition.MONOTAX,
  },
  {
    name: 'Carlos',
    lastName: 'Rodríguez',
    phone: '+549221987654',
    email: 'carlos.r@example.com',
    fiscalCondition: FiscalCondition.FINAL_CONSUMER,
  },
  {
    name: 'Ana',
    lastName: 'Martínez',
    phone: '+549261456789',
    email: 'ana.martinez@example.com',
    fiscalCondition: FiscalCondition.MONOTAX,
    active: true,
  },
  {
    name: 'Empresa',
    lastName: 'Exenta S.A.',
    phone: '+549115555444',
    email: 'compras@exenta.com',
    fiscalCondition: FiscalCondition.EXEMPT,
  },

  // --- GASTRONOMÍA (Restaurantes y Hoteles) ---
  {
    name: 'Restaurante',
    lastName: 'La Toscana',
    phone: '+549351444555',
    email: 'compras@latoscana.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },
  {
    name: 'Bistro',
    lastName: 'El Gourmet',
    phone: '+549351222333',
    email: 'chef@elgourmet.com.ar',
    fiscalCondition: FiscalCondition.MONOTAX,
  },
  {
    name: 'Hotel',
    lastName: 'Sierras Hotel',
    phone: '+549354155666', // CORREGIDO: Ajustado a 13 chars
    email: 'proveedores@sierrashotel.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },
  {
    name: 'Pizzería',
    lastName: 'Don Luis',
    phone: '+549351999888',
    email: 'admin@pizzeriadonluis.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },

  // --- COMERCIOS (Verdulerías y Dietéticas) ---
  {
    name: 'Verdulería',
    lastName: 'El Abasto',
    phone: '+549113334444',
    email: 'pedidos@elabasto.com',
    fiscalCondition: FiscalCondition.MONOTAX,
  },
  {
    name: 'Dietética',
    lastName: 'Vida Sana',
    phone: '+549351777111',
    email: 'contacto@vidasana.com.ar',
    fiscalCondition: FiscalCondition.MONOTAX,
  },
  {
    name: 'Mercado',
    lastName: 'Orgánico Sur',
    phone: '+549261555999',
    email: 'info@organicosur.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },

  // --- INDUSTRIA Y PROCESADORES ---
  {
    name: 'Especias',
    lastName: 'Cuyo S.R.L.',
    phone: '+549264123123',
    email: 'compras@especiascuyo.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },
  {
    name: 'Cooperativa',
    lastName: 'Agrícola Local',
    phone: '+549353111222',
    email: 'administracion@cooperativa.org.ar',
    fiscalCondition: FiscalCondition.EXEMPT,
  },
  {
    name: 'Té & Hierbas',
    lastName: 'Patagonia',
    phone: '+549299000111',
    email: 'insumos@tepatagonia.com',
    fiscalCondition: FiscalCondition.RESPONSIBLE,
  },

  // --- CONSUMIDORES FINALES / EMPRENDEDORES ---
  {
    name: 'Marta',
    lastName: 'Dulces Artesanales',
    phone: '+549354888777',
    email: 'marta.dulces@gmail.com',
    fiscalCondition: FiscalCondition.FINAL_CONSUMER,
  },
  {
    name: 'Lucas',
    lastName: 'Chef Privado',
    phone: '+549116667777',
    email: 'lucas.chef@hotmail.com',
    fiscalCondition: FiscalCondition.FINAL_CONSUMER,
  },
  {
    name: 'Fermentos',
    lastName: 'Vivos',
    phone: '+549351000999',
    email: 'fermentos@outlook.com',
    fiscalCondition: FiscalCondition.MONOTAX,
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
  // Evitar fechas futuras si 'end' es SIM_TODAY
  const actualEnd = end > SIM_TODAY ? SIM_TODAY : end
  if (start >= actualEnd) return actualEnd
  return new Date(
    start.getTime() + Math.random() * (actualEnd.getTime() - start.getTime()),
  )
}

/** Suma minutos a una fecha */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

// --- FUNCIONES DE TRANSACCIONES ---

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

/** T3: Simula el flujo completo de una venta: Pide, Cobra y Entrega */
// Definimos un tipo para los items del carrito para mayor claridad
type CartItem = {
  batch: Batch
  product: Product
  quantity: number
}

/** T3: Simula el flujo completo de una venta MULTI-PRODUCTO */
async function createFullOrderFlow(
  prisma: PrismaClient,
  {
    customer,
    seller,
    items, // <--- Ahora recibimos un array de items
    date,
  }: {
    customer: Customer
    seller: User
    items: CartItem[]
    date: Date
  },
) {
  const orderDate = date
  const saleDate = addMinutes(orderDate, getRandomInt(5, 60 * 2))
  const deliveryDate = addMinutes(saleDate, getRandomInt(5, 60 * 4))

  return prisma.$transaction(async tx => {
    // Calcular total de la orden
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )

    // 1. Crear Pedido (ORDERED) Header
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

    // Crear el Movimiento de Reserva (Uno solo para toda la orden)
    const orderMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.ORDERED,
        orderId: order.id,
        createdAt: orderDate,
      },
    })

    // Iterar items para: Detalles de Orden, Actualizar Lotes, Detalles de Movimiento
    for (const item of items) {
      // a. Order Detail
      await tx.orderDetail.create({
        data: {
          orderId: order.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      })

      // b. Actualizar Lote (Reserva)
      await tx.batch.update({
        where: { id: item.batch.id },
        data: {
          marketQuantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity },
          updatedAt: orderDate,
        },
      })

      // c. Movement Detail (Vincula este lote al movimiento de la orden)
      await tx.movementDetail.create({
        data: {
          movementId: orderMovement.id,
          batchId: item.batch.id,
          quantity: item.quantity,
        },
      })
    }

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
        paymentReceipt: '',
        discount: 0,
        subtotal: total,
        total: total,
        createdAt: saleDate,
        updatedAt: saleDate,
      },
    })

    // Mover stock de Reservado a Sold para cada item
    for (const item of items) {
      await tx.batch.update({
        where: { id: item.batch.id },
        data: {
          reservedQuantity: { decrement: item.quantity },
          soltQuantity: { increment: item.quantity },
          updatedAt: saleDate,
        },
      })
      await tx.movementDetail.create({
        data: {
          movementId: saleMovement.id,
          batchId: item.batch.id,
          quantity: item.quantity,
        },
      })
    }

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

    for (const item of items) {
      await tx.movementDetail.create({
        data: {
          movementId: delMovement.id,
          batchId: item.batch.id,
          quantity: item.quantity,
        },
      })
    }

    return order
  })
}

/** T4: Crea un pedido PENDIENTE (solo reserva stock, sin cobrar ni entregar) */
async function createPendingOrder(
  prisma: PrismaClient,
  {
    customer,
    seller,
    items, // <-- Cambio a items
    date,
  }: {
    customer: Customer
    seller: User
    items: CartItem[]
    date: Date
  },
) {
  return prisma.$transaction(async tx => {
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )

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

    const orderMovement = await tx.movement.create({
      data: {
        userId: seller.id,
        type: MovementType.ORDERED,
        orderId: order.id,
        createdAt: date,
      },
    })

    for (const item of items) {
      await tx.orderDetail.create({
        data: {
          orderId: order.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          createdAt: date,
          updatedAt: date,
        },
      })
      await tx.batch.update({
        where: { id: item.batch.id },
        data: {
          marketQuantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity },
          updatedAt: date,
        },
      })
      await tx.movementDetail.create({
        data: {
          movementId: orderMovement.id,
          batchId: item.batch.id,
          quantity: item.quantity,
        },
      })
    }
    return order
  })
}
/** T6: Crea un movimiento de descarte y resta el stock de DEPOSIT */
async function createDiscard(
  prisma: PrismaClient,
  {
    batch,
    userId,
    quantity,
    date,
  }: {
    batch: Batch
    userId: number
    quantity: number
    date: Date // <-- Parámetro de fecha
  },
) {
  return prisma.$transaction(async tx => {
    // 1. Actualizar Batch: Restar de DEPOSIT y sumar a DISCARDED
    await tx.batch.update({
      where: { id: batch.id },
      data: {
        depositQuantity: { decrement: quantity },
        discardedQuantity: { increment: quantity },
        updatedAt: date,
      },
    })

    // 2. Crear Movimiento de Descarte
    const movement = await tx.movement.create({
      data: {
        userId: userId,
        type: MovementType.DISCARDED,
        createdAt: date,
      },
    })

    // 3. Crear Registro de Descarte (Discard)
    await tx.discard.create({
      data: {
        movementId: movement.id,
        reason: getRandomElement([
          DiscardReason.DAMAGED,
          DiscardReason.EXPIRED,
          DiscardReason.OTHER,
        ]),
        createdAt: date,
        updatedAt: date,
      },
    })

    // 4. Crear Detalle de Movimiento
    await tx.movementDetail.create({
      data: { movementId: movement.id, batchId: batch.id, quantity: quantity },
    })
    return movement
  })
}

type ShipmentItem = {
  batch: Batch
  quantity: number
}

/** Envío Masivo: Mueve múltiples lotes en un solo Shipment/Movement */
async function createBulkShipmentAndReceive(
  prisma: PrismaClient,
  {
    items,
    depositUser,
    sellerUser,
    date,
  }: {
    items: ShipmentItem[]
    depositUser: User
    sellerUser: User
    date: Date
  },
) {
  const sentDate = date
  const receivedDate = addMinutes(date, 60) // Se recibe 1 hora después

  return prisma.$transaction(async tx => {
    // --- 1. ENVÍO (SENT) ---
    // Crear el Movimiento Cabecera
    const sentMovement = await tx.movement.create({
      data: {
        userId: depositUser.id,
        type: MovementType.SENT,
        createdAt: sentDate,
      },
    })

    // Crear el Shipment Cabecera
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

    // Procesar cada lote del envío
    for (const item of items) {
      // Actualizar Stock del Lote
      await tx.batch.update({
        where: { id: item.batch.id },
        data: {
          depositQuantity: { decrement: item.quantity },
          sentQuantity: { increment: item.quantity },
          updatedAt: sentDate,
        },
      })
      // Crear Detalle del Movimiento
      await tx.movementDetail.create({
        data: {
          movementId: sentMovement.id,
          batchId: item.batch.id,
          quantity: item.quantity,
        },
      })
    }

    // --- 2. RECEPCIÓN (RECEIVED_MARKET) ---
    // Actualizar Shipment
    await tx.shipment.update({
      where: { id: shipment.id },
      data: { status: ShipmentStatus.RECEIVED_OK, updatedAt: receivedDate },
    })

    // Crear Movimiento de Recepción
    const recMovement = await tx.movement.create({
      data: {
        userId: sellerUser.id,
        type: MovementType.RECEIVED_MARKET,
        createdAt: receivedDate,
      },
    })

    // Procesar recepción de lotes
    for (const item of items) {
      await tx.batch.update({
        where: { id: item.batch.id },
        data: {
          sentQuantity: { decrement: item.quantity },
          marketQuantity: { increment: item.quantity },
          receivedQuantity: { increment: item.quantity },
          updatedAt: receivedDate,
        },
      })
      await tx.movementDetail.create({
        data: {
          movementId: recMovement.id,
          batchId: item.batch.id,
          quantity: item.quantity,
        },
      })
    }
  })
}

// --- FUNCIÓN CENTRAL DE SIMULACIÓN MENSUAL ---
async function simulateMonth(
  prisma: PrismaClient,
  monthStart: Date,
  monthEnd: Date,
  users: User[],
  products: Product[],
  customers: Customer[],
) {
  const depositUser = users.find(u => u.role === Role.DEPOSIT)!
  const sellerUser = users.find(u => u.role === Role.SELLER)!
  const monthDuration = monthEnd.getTime() - monthStart.getTime()

  console.log(
    ` -> Simulating from ${monthStart.toISOString().split('T')[0]} to ${
      monthEnd.toISOString().split('T')[0]
    }`,
  )

  // Configuración
  const batchesPerDay = Math.ceil(
    TOTAL_BATCH_STOCK_IN_MONTH / NUM_DAYS_IN_MONTH_SIM,
  )
  let batchCounter = (await prisma.batch.count()) + 1
  const ordersPerDay = Math.floor(NUM_ORDERS_PER_MONTH / NUM_DAYS_IN_MONTH_SIM)
  const discardPerDay = NUM_DISCARDS_PER_MONTH / NUM_DAYS_IN_MONTH_SIM
  let ordersCreatedCount = 0

  // --- BUCLE DIARIO ---
  for (let day = 0; day < NUM_DAYS_IN_MONTH_SIM; day++) {
    const dayStart = addMinutes(
      monthStart,
      (day * (monthDuration / NUM_DAYS_IN_MONTH_SIM)) / 60000,
    )
    const dayEnd = addMinutes(
      monthStart,
      ((day + 1) * (monthDuration / NUM_DAYS_IN_MONTH_SIM)) / 60000,
    )

    if (dayEnd > SIM_TODAY) break

    // Array para acumular lo producido en el día antes de enviarlo
    const dailyProduction: ShipmentItem[] = []

    // 1. Producción de Stock (Ingreso en Depósito)
    for (let i = 0; i < batchesPerDay; i++) {
      const product = getRandomElement(products)
      // Se produce temprano (entre 06:00 y 12:00)
      const stockDate = getRandomDate(dayStart, addMinutes(dayStart, 60 * 6))
      const quantity = getRandomInt(50, MAX_BATCH_SIZE)

      // a. Crear Lote (STORED)
      let batch = await createStock(prisma, {
        productId: product.id,
        userId: depositUser.id,
        quantity: quantity,
        code: `LOTE-${product.code}-${batchCounter++}`,
        date: stockDate,
      })

      // b. Descarte (Opcional)
      if (i < discardPerDay) {
        const discardDate = addMinutes(stockDate, getRandomInt(5, 30))
        const discardQuantity = getRandomInt(1, 5)
        if (batch.depositQuantity >= discardQuantity) {
          await createDiscard(prisma, {
            batch: batch,
            userId: depositUser.id,
            quantity: discardQuantity,
            date: discardDate,
          })
          // Recargar batch actualizado
          batch = (await prisma.batch.findUnique({
            where: { id: batch.id },
          })) as Batch
        }
      }

      // c. Agregar a la lista de "Pendiente de Envío"
      // (No enviamos todavía, solo acumulamos)
      if (batch.depositQuantity > 0) {
        dailyProduction.push({
          batch: batch,
          quantity: batch.depositQuantity, // Se envía todo lo que quedó en depósito
        })
      }
    }

    // 2. Realizar Envíos Masivos (Máximo 2 por día)
    if (dailyProduction.length > 0) {
      // Decidir si hacemos 1 o 2 envíos
      const numberOfShipments = getRandomInt(1, 2)

      // Dividir la producción en partes
      const chunkSize = Math.ceil(dailyProduction.length / numberOfShipments)

      for (let s = 0; s < numberOfShipments; s++) {
        const chunk = dailyProduction.slice(s * chunkSize, (s + 1) * chunkSize)

        if (chunk.length > 0) {
          // Hora del envío: Uno al mediodía, otro a la tarde (aprox)
          const shipmentHourOffset = s === 0 ? 360 : 720 // +6hs o +12hs desde inicio del día
          const shipmentDate = addMinutes(
            dayStart,
            shipmentHourOffset + getRandomInt(0, 60),
          )

          await createBulkShipmentAndReceive(prisma, {
            items: chunk,
            depositUser: depositUser,
            sellerUser: sellerUser,
            date: shipmentDate,
          })
        }
      }
    }

    // 3. Ventas (Consumen del Mercado)
    let availableBatches = await prisma.batch.findMany({
      where: { marketQuantity: { gt: 5 } },
      include: { product: true },
    })

    for (let i = 0; i < ordersPerDay; i++) {
      if (availableBatches.length < 3) break

      const randomCustomer = getRandomElement(customers)
      // Las ventas ocurren después de los envíos (tarde/noche)
      const salesStart = addMinutes(dayStart, 600) // 10 horas después del inicio
      const randomDate = getRandomDate(salesStart, dayEnd)

      const maxLines = Math.min(10, availableBatches.length)
      const targetLines = getRandomInt(3, maxLines)

      const cart: CartItem[] = []
      const tempAvailable = [...availableBatches]

      for (let line = 0; line < targetLines; line++) {
        if (tempAvailable.length === 0) break
        const batchIndex = getRandomInt(0, tempAvailable.length - 1)
        const selectedBatch = tempAvailable[batchIndex]
        tempAvailable.splice(batchIndex, 1)

        let quantityToOrder = getRandomInt(6, 20)
        if (quantityToOrder > selectedBatch.marketQuantity)
          quantityToOrder = selectedBatch.marketQuantity

        if (quantityToOrder > 0) {
          cart.push({
            batch: selectedBatch,
            product: selectedBatch.product,
            quantity: quantityToOrder,
          })
        }
      }

      if (cart.length > 0) {
        cart.sort((a, b) => a.batch.id - b.batch.id)
        try {
          await createFullOrderFlow(prisma, {
            customer: randomCustomer,
            seller: sellerUser,
            items: cart,
            date: randomDate,
          })
          ordersCreatedCount++
          // Optimistic update
          for (const item of cart) {
            const originalBatch = availableBatches.find(
              b => b.id === item.batch.id,
            )
            if (originalBatch) {
              originalBatch.marketQuantity -= item.quantity
              if (originalBatch.marketQuantity < 6)
                availableBatches = availableBatches.filter(
                  b => b.id !== originalBatch.id,
                )
            }
          }
        } catch (error) {}
      }
    }
  }

  // --- FASE DE LIQUIDACIÓN (CLEANUP) ---
  console.log('  - 🧹 Liquidando stock restante...')
  const leftovers = await prisma.batch.findMany({
    where: { marketQuantity: { gt: 0 } },
    include: { product: true },
  })

  const liquidationDate = monthEnd > SIM_TODAY ? SIM_TODAY : monthEnd

  while (leftovers.length > 0) {
    const batchChunk = leftovers.splice(0, 10)
    const cart: CartItem[] = []
    for (const batch of batchChunk) {
      cart.push({
        batch: batch,
        product: batch.product,
        quantity: batch.marketQuantity,
      })
    }

    if (cart.length > 0) {
      const bulkCustomer = getRandomElement(customers)
      cart.sort((a, b) => a.batch.id - b.batch.id)
      try {
        await createFullOrderFlow(prisma, {
          customer: bulkCustomer,
          seller: sellerUser,
          items: cart,
          date: addMinutes(liquidationDate, -getRandomInt(60, 300)),
        })
        ordersCreatedCount++
      } catch (e) {}
    }
  }
  console.log(`  - ✅ Mes finalizado. Total Pedidos: ${ordersCreatedCount}.`)
}

// --- FUNCIÓN PRINCIPAL DEL SEED ---

async function main() {
  // A. Calcular fechas de inicio y fin del mes seleccionado
  // Nota: En JS los meses van de 0 (Ene) a 11 (Dic), por eso restamos 1.
  const monthStart = new Date(ANIO_A_CARGAR, MES_A_CARGAR - 1, 1)
  const monthEnd = new Date(ANIO_A_CARGAR, MES_A_CARGAR, 1) // El día 1 del mes siguiente

  console.log('----------------------------------------------------------')
  console.log(`🚀 INICIANDO SEED MANUAL PARA: ${MES_A_CARGAR}/${ANIO_A_CARGAR}`)
  console.log(`   Desde: ${monthStart.toLocaleDateString()}`)
  console.log(`   Hasta: ${monthEnd.toLocaleDateString()}`)
  console.log('----------------------------------------------------------')

  // B. Limpieza de Base de Datos (Solo si LIMPIAR_DB es true)
  if (LIMPIAR_DB) {
    console.log(
      '⚠️  ALERTA: Borrando base de datos completa (LIMPIAR_DB = true)...',
    )
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

    // C. Crear Modelos Básicos (Solo si limpiamos la DB)
    console.log('🌱 Creando usuarios, productos y clientes base...')
    await prisma.user.createMany({ data: initialUsers })
    await prisma.product.createMany({ data: initialProducts })
    await prisma.customer.createMany({ data: initialCustomers })
  } else {
    console.log('ℹ️  MODO INCREMENTAL: Se conservan los datos existentes.')
  }

  // D. Recuperar datos necesarios (Siempre necesario)
  const users = await prisma.user.findMany()
  const products = await prisma.product.findMany({ where: { active: true } })
  const customers = await prisma.customer.findMany({ where: { active: true } })

  if (users.length === 0 || products.length === 0) {
    throw new Error(
      '❌ No hay usuarios o productos. Pon LIMPIAR_DB = true para inicializarlos.',
    )
  }

  // E. Ejecutar la Simulación del Mes
  await simulateMonth(prisma, monthStart, monthEnd, users, products, customers)

  // F. Solo si el mes cargado es el ACTUAL, generamos el pendiente de "Hoy"
  const isCurrentMonth =
    SIM_TODAY.getMonth() === MES_A_CARGAR - 1 &&
    SIM_TODAY.getFullYear() === ANIO_A_CARGAR

  if (isCurrentMonth) {
    console.log(
      '\n🕒 Mes actual detectado: Generando orden PENDIENTE del día...',
    )
    const sellerUser = users.find(u => u.role === Role.SELLER)!
    const availableBatches = await prisma.batch.findMany({
      where: { marketQuantity: { gt: 0 } },
      include: { product: true },
    })

    if (availableBatches.length > 0) {
      const batch = getRandomElement(availableBatches)
      const customer = getRandomElement(customers)
      await createPendingOrder(prisma, {
        customer,
        seller: sellerUser,
        items: [
          {
            batch,
            product: batch.product,
            quantity: 1,
          },
        ],
        date: new Date(), // Hora actual real
      })
      console.log('   -> Orden pendiente creada.')
    }
  }

  console.log('----------------------------------------------------------')
  console.log('✅ Carga del mes finalizada exitosamente.')
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

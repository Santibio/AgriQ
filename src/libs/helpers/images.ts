import path from "path";
import { promises as fs } from "fs";

// Función para guardar una imagen en la carpeta 'public/images/avatars'
export async function saveImage(
  file: File,
  username: string,
  folder: string = "avatars"
): Promise<string> {
  // Generar un nombre único para la imagen
  const imageName = `${username}.jpg`;
  const imageDir = path.join(process.cwd(), "public", "images", folder);

  // Asegurarse de que la carpeta existe
  await fs.mkdir(imageDir, { recursive: true });

  // Ruta completa del archivo donde se va a guardar la imagen
  const imagePath = path.join(imageDir, imageName);

  // Leer el archivo y guardarlo en el sistema de archivos
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(imagePath, buffer);

  // Devolver la ruta relativa de la imagen para guardarla en la base de datos
  return `/images/${folder}/${imageName}`;
}

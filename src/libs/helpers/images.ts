import path from "path";
import { promises as fs } from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para guardar una imagen en la carpeta 'public/images/avatars'

export async function saveImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const resultedImage = await new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, (err, result) => {
        if (err) reject(err);
        else if (result?.secure_url) resolve(result.secure_url);
        else reject(new Error("Failed to get secure URL"));
      })
      .end(buffer);
  });

  return resultedImage;
}
// Función para borrar una imagen en la carpeta 'public/images/avatars'
export async function deleteImage(
  username: string,
  folder: string = "avatars"
): Promise<void> {
  // Generar el nombre de la imagen a eliminar
  const imageName = `${username}.jpg`;
  const imagePath = path.join(
    process.cwd(),
    "public",
    "images",
    folder,
    imageName
  );

  try {
    // Eliminar el archivo
    await fs.unlink(imagePath);
    console.log(`Imagen ${imageName} eliminada con éxito.`);
  } catch (error) {
    console.error(`Error al eliminar la imagen: ${error}`);
    throw new Error(`No se pudo eliminar la imagen: ${imageName}`);
  }
}

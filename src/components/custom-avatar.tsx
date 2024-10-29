import { UserRound } from "lucide-react";
import Image from "next/image";
import React from "react";

interface CustomAvatarProps {
  src: string;
  alt?: string;
  size?: number; // Define el tamaño del avatar
  isBordered?: boolean; // Si el avatar tiene borde o no
  className?: string; // Clases personalizadas si es necesario
}

const CustomAvatar = ({
  src,
  alt = "Avatar",
  size = 50,
  isBordered = false,
  className = "",
}: CustomAvatarProps) => {
  return (
    <>
      {src ? (
        <div
          className={`relative inline-block ${
            isBordered ? "border border-gray-300 rounded-full" : ""
          } ${className}`}
          style={{ width: size, height: size }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100%"
            className="rounded-full object-cover" // Asegura que la imagen tenga bordes redondeados
            priority // Optimiza la carga de la imagen
          />
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
          <UserRound size={30} className="stroke-" />
        </div>
      )}
    </>
  );
};

export default CustomAvatar;

"use client";

import { Button } from "@nextui-org/react";
import { ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname(); // Obtiene la ruta actual

  const handleGoBack = () => {
    const pathArray = pathname.split("/"); // Divide la ruta actual en segmentos

    if (pathArray.length > 2) {
      pathArray.pop(); // Elimina el último segmento
      const newPath = pathArray.join("/"); // Une los segmentos restantes
      router.push(newPath); // Navega a la nueva ruta
    } else {
      router.push("/"); // Si solo queda la raíz, redirige a "/"
    }
  };
  return (
    <Button isIconOnly variant="light" onClick={handleGoBack}>
      <ChevronLeft />
    </Button>
  );
}

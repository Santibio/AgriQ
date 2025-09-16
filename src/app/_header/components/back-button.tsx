"use client";

import paths from "@/libs/paths";
import { Button } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();

  const isHome = pathname === paths.home();
  const router = useRouter();

  const handleGoBack = () => {
    const pathArray = pathname.split("/");

    if (pathArray.length > 2) {
      pathArray.pop();
      const newPath = pathArray.join("/");
      router.push(newPath);
    } else {
      router.push("/");
    }
  };

  if (isHome) return <div className="w-10" />;

  return (
    <Button isIconOnly variant="light" onPress={handleGoBack}>
      <ChevronLeft />
    </Button>
  );
}

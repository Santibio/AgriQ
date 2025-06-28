"use client";

import { Card, CardFooter } from "@heroui/react";
import { useRouter } from "next/navigation";

interface NavbarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  hasPermission: boolean;
}

interface NavbarItemsListProps {
  itemsWithPermission: NavbarItem[];
}

export default function NavbarItemsList({ itemsWithPermission }: NavbarItemsListProps) {
  const router = useRouter();
  return (
    <div className="gap-6 grid grid-cols-2 pb-4">
      {itemsWithPermission.map((item) => (
        <Card
          shadow="sm"
          key={item.name}
          isPressable
          className="pl-10 h-full w-full"
          isDisabled={!item.hasPermission}
          onClick={() => item.hasPermission && router.push(item.href)}
        >
          <div className="absolute top-4 left-4">{item.icon}</div>
          <CardFooter className="flex-col items-start">
            <b className="text-start text-primary">{item.name}</b>
            <p className="text-default-500 text-start text-small">
              {item.description}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

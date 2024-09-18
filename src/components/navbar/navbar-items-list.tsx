"use client";
import config from "@/config";
import { Card, CardFooter } from "@nextui-org/react";
import Link from "next/link";

export default function NavbarItemsList() {
  return (
    <div className="gap-6 grid grid-cols-2 sm:grid-cols-4">
      {config.navItems.map((item) => (
        <Link key={item.name} href={item.href}>
          <Card
            shadow="sm"
            key={item.name}
            isPressable
            className="pl-10 h-full"
          >
            <div className="absolute top-4 left-4">
              {item.icon}
            </div>
            <CardFooter className="flex-col items-start">
              <b className="text-start text-primary">{item.name}</b>
              <p className="text-default-500 text-start text-small">{item.description}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
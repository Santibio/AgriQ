"use client";
import { Product } from "@prisma/client";
import {
  CardBody,
  ScrollShadow,
  Card,
  CardFooter,
  Image,
} from "@nextui-org/react";
import Link from "next/link";
import paths from "@/libs/paths";

interface ProductsListProps {
  products: Product[];
}

export default function ProductsList({ products }: ProductsListProps) {
  return (
    <ScrollShadow className="h-[70dvh] pb-1">
      <div className="gap-6 grid grid-cols-2 sm:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={paths.productEdit(product.id.toString())}
            className=" w-full"
          >
            <Card shadow="sm" isPressable>
              <CardBody className="overflow-visible p-0">
                <Image
                  shadow="sm"
                  radius="lg"
                  width={200}
                  alt={product.name}
                  className="object-cover h-[140px] w-[200px]"
                  src={product.image}
                />
              </CardBody>
              <CardFooter className="text-small justify-between">
                <b className="capitalize">{product.name}</b>
                <p className="text-default-500">{product.code}</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </ScrollShadow>
  );
}

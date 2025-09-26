'use client';
import { Product } from '@prisma/client';
import {
  CardBody,
  Card,
  Image,
  Chip,
} from '@heroui/react';
import Link from 'next/link';
import paths from '@/lib/paths';
import EmptyListMsg from '@/components/empty-list';
import { convertToArgentinePeso } from '@/lib/helpers/number';

interface ProductsListProps {
  products: Product[];
}

export default function ProductsList({ products }: ProductsListProps) {
  if (!products.length)
    return <EmptyListMsg text="No hay productos disponibles." />;
  return (
    <ul className="flex gap-4 flex-col">
      {products.map((product) => (
        <li key={product.id} className="w-full">
          <Link
            href={paths.productEdit(product.id.toString())}
            className="w-full"
          >
            <Card shadow="none" isPressable isDisabled={!product.active} className="w-full border-1">
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <Image
                    alt={product.name}
                    src={product.image}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg"
                  />
                  <div className="flex flex-col gap-1 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg capitalize">{product.name}</h4>
                        <p className="text-xs text-slate-500">Código: {product.code}</p>
                      </div>
                      <Chip color={product.active ? 'success' : 'danger'} variant="flat" size="sm">
                        {product.active ? 'Activo' : 'Inactivo'}
                      </Chip>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <Chip color="primary" variant="bordered" size="sm" className="capitalize">{product.category}</Chip>
                      <Chip color="secondary" variant="bordered" size="sm" className="capitalize">{product.type}</Chip>
                      <Chip color="default" variant="bordered" size="sm" className="capitalize">{product.presentation}</Chip>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {convertToArgentinePeso(product.price)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        </li>
      ))
      }
    </ul>
  );
}

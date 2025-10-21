'use client'

import { Product, Batch } from '@prisma/client'
import { CardBody, Image } from '@heroui/react'
import { capitalize } from '@/lib/helpers/text'
import EmptyListMsg from '@/components/empty-list'
import Link from 'next/link'
import paths from '@/lib/paths'
import { timeAgo } from '@/lib/helpers/date'
import CardWithShadow from '@/components/card-with-shadow'
import { useState } from 'react'
import { Search } from '@/components/search'

interface ProductionsListProps {
  productions: ProductionWithRelations[]
}

type ProductionWithRelations = Batch & {
  product: Product
}

export default function ProductionsList({ productions }: ProductionsListProps) {
  const [filteredProductions, setFilteredProductions] = useState(productions)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (searchTermValue: string) => {
    setSearchTerm(searchTermValue)
    const lowercasedFilter = searchTermValue.toLowerCase()
    const filtered = productions.filter(production => {
      const productName = production.product.name.toLowerCase()
      const lotNumber = production.id.toString()

      return (
        productName.includes(lowercasedFilter) ||
        lotNumber.includes(lowercasedFilter)
      )
    })
    setFilteredProductions(filtered)
  }

  if (!productions.length)
    return <EmptyListMsg text='No hay lotes disponibles.' />

  return (
    <div className='flex flex-col gap-2'>
      <Search
        placeholder='Buscar por nombre de producto o número de lote'
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
      />
      <ul className='flex gap-2 flex-col'>
        {filteredProductions.map(production => (
          <li key={production.id}>
            <Link
              href={paths.productionEdit(production.id.toString())}
              className=' w-full'
            >
              <CardWithShadow isPressable>
                <CardBody className='flex border rounded-md p-4 gap-4 flex-row'>
                  <Image
                    src={production.product.image}
                    alt={production.product.name}
                    width={60}
                    height={60}
                    className='object-cover rounded-md'
                  />
                  <div className='flex-1'>
                    <div className='flex flex-col gap-1 justify-between'>
                      <div className='flex justify-between items-center'>
                        <span className='font-semibold text-xl'>{`Lote #${production.id}`}</span>
                        <span className='text-slate-500 text-sm'>
                          {timeAgo(production?.createdAt)}
                        </span>
                      </div>
                      <div className='flex gap-2 justify-between items-center'>
                        <span className='rounded-lg  text-slate-400 font-light'>
                          {capitalize(production.product.name)}
                        </span>
                        <span className='rounded-lg  text-slate-400 font-bold text-sm'>
                          x{production.initialQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </CardWithShadow>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

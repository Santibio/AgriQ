import { Input } from '@heroui/react'
import { SearchIcon } from 'lucide-react'

interface SearchProps {
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  placeholder?: string
  label?: string
}

export function Search({
  searchTerm,
  setSearchTerm,
  placeholder,
  label,
}: SearchProps) {
  return (
    <div>
      <Input
        label={label}
        placeholder={placeholder}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        startContent={<SearchIcon size={18} />}
      />
    </div>
  )
}

import { Input } from '@heroui/react'
import { SearchIcon } from 'lucide-react'

interface SearchProps {
  searchTerm: string
  handleSearchChange: (searchTerm: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function Search({
  searchTerm,
  placeholder,
  label,
  handleSearchChange,
  className,
}: SearchProps) {
  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={searchTerm}
      onChange={e => handleSearchChange(e.target.value)}
      startContent={<SearchIcon size={18} />}
      className={className}
    />
  )
}

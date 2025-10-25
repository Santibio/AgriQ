export const capitalize = (str: string | undefined): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const removeAccents = (str: string | undefined): string => {
  if (!str) return ''
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

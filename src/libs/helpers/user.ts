export function usernameGenerator(name: string, lastName: string): string {
  const trimmedName = name.trim();
  const trimmedLastName = lastName.trim();
  if (!trimmedName || !trimmedLastName) return "";
  return `${trimmedName.toLowerCase()}.${trimmedLastName.toLowerCase()}`;
}

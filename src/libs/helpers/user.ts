export function usernameGenerator(name: string, lastName: string): string {
  const trimmedName = name.trim();
  const trimmedLastName = lastName.trim();

  if (!trimmedName || !trimmedLastName) return "";

  const firstName = trimmedName.split(' ')[0];
  const firstLastName = trimmedLastName.split(' ')[0];

  const result = `${firstName.toLowerCase()}.${firstLastName.toLowerCase()}`;
  
  return result 
}

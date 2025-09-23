import bcrypt from "bcryptjs";

export const encrypt = async (string: string) => bcrypt.hash(string, 10);

export const compareHash = async (string: string, hash: string) =>
  bcrypt.compare(string, hash);

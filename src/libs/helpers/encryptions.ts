import bcrypt from "bcryptjs";

export const encrypt = async (string: string) => {
  return await bcrypt.hash(string, 10);
};

export const compareHash = async (string: string, hash: string) => {
  return await bcrypt.compare(string, hash);
};

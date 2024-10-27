import bcrypt from "bcryptjs";

export const encrypt = async (string: string) => {
  return await bcrypt.hash(string, 10);
};

export const comparedHash = (string: string, hash: string) => {
  return bcrypt.compare(string, hash);
};

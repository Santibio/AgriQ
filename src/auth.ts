import { cookies } from "next/headers";
import { jwtVerify } from "jose"; // Importar funciones de jose

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const validateRequest = async (): Promise<{
  userId: number | null;
  isExpired: boolean;
  userRole: string | null;
}> => {
  const token = (await cookies()).get("token")?.value ?? null;

  if (!token) {
    return {
      userId: null,
      isExpired: true,
      userRole: null,
    };
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verificar el token y obtener sus claims
    const { payload } = await jwtVerify(token!, secret);

    const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : false;

    // Asegurarse de que userId existe y es un número
    const userId = typeof payload.userId === "number" ? payload.userId : null;
    // Asegurarse de que userId existe y es un número
    const userRole =
      typeof payload.userRole === "string" ? payload.userRole : null;

    return {
      userId,
      isExpired,
      userRole,
    };
  } catch {
    return {
      userId: null,
      userRole: null,
      isExpired: true,
    };
  }
};

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Importar funciones de jose

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const response = NextResponse.next();
  response.headers.set("x-debug-token", token || "No token");
  response.headers.set("x-debug-path", request.nextUrl.pathname);

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token!, secret);
  } catch (error) {
    console.log("error: ", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico).*)", // Excluir rutas específicas
  ],
};
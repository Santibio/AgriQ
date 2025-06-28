import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "./auth";
import { Role } from "@prisma/client";

function redirectToLogin(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/login", request.url));
}

function isProtectedRoute(pathname: string): Array<string> {
  const protectedRoutes: Record<string, Array<string>> = {
    "/production": [Role.ADMIN, Role.DEPOSIT],
    "/discards": [Role.ADMIN, Role.DEPOSIT],
    "/shipments": [Role.ADMIN, Role.DEPOSIT],
    "/returns-reception": [Role.ADMIN, Role.DEPOSIT],
    "/sales": [Role.ADMIN, Role.SELLER],
    "/shipment-reception": [Role.ADMIN, Role.SELLER],
    "/returns": [Role.ADMIN, Role.SELLER],
    "/reports": [Role.ADMIN, Role.DEPOSIT, Role.SELLER],
    "/users": [Role.ADMIN],
    "/products": [Role.ADMIN],
  };

  return protectedRoutes[pathname] || [];
}

function hasAccess(userRole: string, allowedRoles: Array<string>): boolean {
  return allowedRoles.includes(userRole);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId, userRole, isExpired } = await validateRequest();

    if (isExpired) {
      console.log("Token expirado");
      return redirectToLogin(request);
    }

    if (!userId || !userRole) {
      console.log("No se encontró el id del usuario");
      return redirectToLogin(request);
    }

    const { pathname } = request.nextUrl;
    const allowedRoles = isProtectedRoute(pathname);

    if (allowedRoles.length > 0 && !hasAccess(userRole, allowedRoles)) {
      console.log("Acceso denegado para el rol: ", userRole);
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
  } catch (error) {
    console.log("Error: ", error);
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico).*)", // Excluir rutas específicas
  ],
};

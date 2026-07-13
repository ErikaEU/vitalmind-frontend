import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";

/**
 * Next.js 16 renombró `middleware.ts` a `proxy.ts` (la función `middleware`
 * ahora se llama `proxy`). Corre en runtime Node.js por defecto, así que
 * puede usar `jose` sin restricciones de Edge Runtime.
 *
 * Protege todas las rutas del panel de la psicóloga bajo app/(admin)/ — que
 * viven en la raíz de la URL (/dashboard, /tamizajes, /resultados, /citas,
 * /disponibilidad, /alumnos) — verificando el JWT guardado en la cookie
 * httpOnly. app/(public)/cuestionario y /login quedan fuera del matcher.
 */
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "vitalmind_token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corre en todo excepto:
     * - /cuestionario (portal público del alumno, sin autenticación)
     * - /login (debe ser alcanzable sin sesión)
     * - /api (rutas API — el proxy /api/backend reenvía sin sesión y deja
     *   que FastAPI responda 401; /cuestionario llama directo al backend)
     * - assets estáticos y de Next.js
     */
    "/((?!cuestionario|login|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthToken } from "@/lib/auth";

/**
 * Proxy same-origin hacia FastAPI para llamadas iniciadas desde Client
 * Components (p. ej. @tanstack/react-query). Inyecta el JWT desde la cookie
 * httpOnly del lado del servidor — el navegador nunca tiene acceso al token.
 *
 * Si no hay cookie de sesión, la request se reenvía sin header Authorization
 * y FastAPI responde 401 (Depends(get_current_personal)); no hace falta
 * duplicar la verificación aquí.
 */
const API_URL = process.env.API_URL ?? "http://localhost:8000";

async function forward(req: NextRequest, path: string[]) {
  const token = await getAuthToken();
  const targetUrl = new URL(`${API_URL}/${path.join("/")}`);
  targetUrl.search = req.nextUrl.search;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = !["GET", "HEAD", "DELETE"].includes(req.method);

  const backendRes = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const resBody = await backendRes.text();
  return new NextResponse(resBody.length ? resBody : null, {
    status: backendRes.status,
    headers: {
      "Content-Type": backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function handler(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return forward(req, path);
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/jwt";
import type { AdminSession, Rol } from "@/lib/types";

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "vitalmind_token";
/** Cookie NO httpOnly — solo guarda datos de presentación (nombre, rol), nunca el JWT. */
export const PROFILE_COOKIE_NAME = `${AUTH_COOKIE_NAME}_profile`;

// Alineado con ACCESS_TOKEN_EXPIRE_MINUTES=480 del backend (app/config.py).
const MAX_AGE_SECONDS = 60 * 60 * 8;

interface ProfileCookiePayload {
  nombre_completo: string;
  rol: Rol;
}

export async function setAuthCookies(
  accessToken: string,
  nombreCompleto: string,
  rol: Rol
) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";

  store.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  const profile: ProfileCookiePayload = { nombre_completo: nombreCompleto, rol };
  store.set(PROFILE_COOKIE_NAME, JSON.stringify(profile), {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
  store.delete(PROFILE_COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/** Sesión actual, o null si no hay token o es inválido/expiró. No redirige. */
export async function getSession(): Promise<AdminSession | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload) return null;

  const store = await cookies();
  let nombre_completo = "";
  const profileRaw = store.get(PROFILE_COOKIE_NAME)?.value;
  if (profileRaw) {
    try {
      nombre_completo = (JSON.parse(profileRaw) as ProfileCookiePayload).nombre_completo ?? "";
    } catch {
      // cookie corrupta o manipulada — se ignora, el nombre queda vacío
    }
  }

  return {
    id_personal: payload.id_personal,
    rol: payload.rol as Rol,
    nombre_completo,
  };
}

/** Igual que getSession(), pero redirige a /login si no hay sesión válida. */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Verificación de JWT sin dependencias de next/headers — se importa tanto
 * desde proxy.ts (Proxy, runtime Node.js) como desde lib/auth.ts (Server
 * Components / Server Actions). Debe firmar/verificar con la MISMA
 * SECRET_KEY que el backend FastAPI (app/utils/security.py).
 */
import { jwtVerify } from "jose";

const ALGORITHM = process.env.JWT_ALGORITHM ?? "HS256";

function getSecret() {
  const key = process.env.JWT_SECRET_KEY;
  if (!key) {
    throw new Error(
      "JWT_SECRET_KEY no está definida. Debe coincidir con SECRET_KEY del backend."
    );
  }
  return new TextEncoder().encode(key);
}

export interface AdminTokenPayload {
  id_personal: number;
  rol: string;
}

/** Verifica firma y expiración. Retorna null si el token es inválido o expiró. */
export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALGORITHM],
    });
    if (typeof payload.sub !== "string") return null;
    return { id_personal: Number(payload.sub), rol: String(payload.rol ?? "") };
  } catch {
    return null;
  }
}

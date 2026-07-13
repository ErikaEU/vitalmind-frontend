"use server";

import { login, ApiError } from "@/lib/api-server";
import { setAuthCookies } from "@/lib/auth";

export interface LoginActionResult {
  error?: string;
  redirectTo?: string;
}

/**
 * Esta acción NO usa redirect() de Next.js. LoginForm la invoca como una
 * función JS normal (no como action nativa de un <form>), y en ese modo el
 * fetch() interno de Next sigue el 303 de redirect() por su cuenta antes de
 * que el router del cliente pueda interceptarlo — la navegación "ocurre" a
 * nivel de red pero la URL/pantalla del navegador nunca se actualiza.
 * En su lugar, devolvemos la ruta destino y LoginForm hace router.replace().
 */
export async function loginAction(
  data: { email: string; password: string },
  next?: string
): Promise<LoginActionResult> {
  try {
    const token = await login(data);
    await setAuthCookies(token.access_token, token.nombre_completo, token.rol);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: "No se pudo conectar con el servidor. Intenta nuevamente." };
  }

  return { redirectTo: next && next.startsWith("/") ? next : "/dashboard" };
}

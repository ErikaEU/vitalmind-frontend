"use server";

import { redirect } from "next/navigation";
import { login, ApiError } from "@/lib/api-server";
import { setAuthCookies } from "@/lib/auth";

export interface LoginActionResult {
  error?: string;
}

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

  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

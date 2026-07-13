"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api-server";
import { ApiError } from "@/lib/http";

export interface ActionResult {
  error?: string;
}

export async function interpretarIAAction(idResultado: number): Promise<ActionResult> {
  try {
    await api.interpretarIA(idResultado);
  } catch (err) {
    return {
      error: err instanceof ApiError ? err.message : "No se pudo generar la interpretación IA.",
    };
  }
  revalidatePath(`/resultados/${idResultado}`);
  return {};
}

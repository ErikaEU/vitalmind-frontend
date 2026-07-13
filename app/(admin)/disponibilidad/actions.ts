"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api-server";
import { ApiError } from "@/lib/http";
import type { DisponibilidadCreate } from "@/lib/types";

export interface ActionResult {
  error?: string;
}

export async function crearSlotAction(data: DisponibilidadCreate): Promise<ActionResult> {
  try {
    await api.crearSlot(data);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo crear el slot." };
  }
  revalidatePath("/disponibilidad");
  return {};
}

export async function eliminarSlotAction(idSlot: number): Promise<ActionResult> {
  try {
    await api.eliminarSlot(idSlot);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo eliminar el slot." };
  }
  revalidatePath("/disponibilidad");
  return {};
}

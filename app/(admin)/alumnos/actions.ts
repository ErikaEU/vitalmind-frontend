"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api-server";
import { ApiError } from "@/lib/http";
import type { AlumnoCreate, AlumnoUpdate } from "@/lib/types";

export interface ActionResult {
  error?: string;
}

export async function crearAlumnoAction(data: AlumnoCreate): Promise<ActionResult> {
  try {
    await api.crearAlumno(data);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo registrar al alumno." };
  }
  revalidatePath("/alumnos");
  return {};
}

export async function actualizarAlumnoAction(
  idAlumno: number,
  data: AlumnoUpdate
): Promise<ActionResult> {
  try {
    await api.actualizarAlumno(idAlumno, data);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo actualizar al alumno." };
  }
  revalidatePath("/alumnos");
  return {};
}

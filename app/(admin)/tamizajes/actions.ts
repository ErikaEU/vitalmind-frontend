"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as api from "@/lib/api-server";
import { ApiError } from "@/lib/http";
import type { TamizajeCreate, TamizajeUpdate } from "@/lib/types";

export interface ActionResult {
  error?: string;
}

export async function crearTamizajeAction(data: TamizajeCreate) {
  const tamizaje = await api.crearTamizaje(data);
  redirect(`/tamizajes/${tamizaje.id_tamizaje}`);
}

export async function actualizarTamizajeAction(
  idTamizaje: number,
  data: TamizajeUpdate
): Promise<ActionResult> {
  try {
    await api.actualizarTamizaje(idTamizaje, data);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo actualizar el tamizaje." };
  }
  revalidatePath(`/tamizajes/${idTamizaje}`);
  revalidatePath("/tamizajes");
  return {};
}

export async function anularTamizajeAction(idTamizaje: number): Promise<ActionResult> {
  return actualizarTamizajeAction(idTamizaje, { estado: "anulado" });
}

export async function activarTamizajeAction(idTamizaje: number): Promise<ActionResult> {
  try {
    await api.activarTamizaje(idTamizaje);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo activar el tamizaje." };
  }
  revalidatePath(`/tamizajes/${idTamizaje}`);
  return {};
}

export async function regenerarTokenAction(
  idTamizaje: number,
  idAlumno: number
): Promise<ActionResult> {
  try {
    await api.regenerarToken({ id_tamizaje: idTamizaje, id_alumno: idAlumno });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo regenerar el token." };
  }
  revalidatePath(`/tamizajes/${idTamizaje}`);
  return {};
}

export interface InvitarAlumnosActionResult extends ActionResult {
  enviados?: number;
  fallidos?: { id_alumno: number; motivo: string }[];
}

export async function invitarAlumnosAction(
  idTamizaje: number,
  idsAlumno: number[]
): Promise<InvitarAlumnosActionResult> {
  try {
    const resultado = await api.invitarAlumnos(idTamizaje, idsAlumno);
    revalidatePath(`/tamizajes/${idTamizaje}`);
    return { enviados: resultado.enviados.length, fallidos: resultado.fallidos };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "No se pudo invitar a los alumnos." };
  }
}

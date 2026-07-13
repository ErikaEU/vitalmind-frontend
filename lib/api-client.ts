/**
 * Cliente HTTP para usar desde Client Components (p. ej. con @tanstack/react-query).
 * Llama al proxy same-origin /api/backend/*, que inyecta el JWT desde la cookie
 * httpOnly del lado del servidor — el navegador nunca ve el token.
 */
import { parseJsonResponse, qs } from "@/lib/http";
import type {
  CitaCreate,
  CitaRead,
  CitaUpdate,
  DisponibilidadRead,
  AlumnoRead,
  ResultadoResumen,
} from "@/lib/types";

const PROXY_BASE = "/api/backend";

async function proxyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${PROXY_BASE}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  return parseJsonResponse<T>(res);
}

// ---------------------------------------------------------------------------
// Resultados — usado por la tabla filtrable por nivel_riesgo
// ---------------------------------------------------------------------------

export function fetchResultadosPorTamizaje(idTamizaje: number, nivelRiesgo?: string) {
  return proxyFetch<ResultadoResumen[]>(
    `/resultados/tamizaje/${idTamizaje}${qs({ nivel_riesgo: nivelRiesgo })}`
  );
}

// ---------------------------------------------------------------------------
// Citas — agenda interactiva de la psicóloga
// ---------------------------------------------------------------------------

export function fetchCitas() {
  return proxyFetch<CitaRead[]>("/citas/");
}

export function fetchCrearCita(data: CitaCreate) {
  return proxyFetch<CitaRead>("/citas/", { method: "POST", body: JSON.stringify(data) });
}

export function fetchActualizarCita(idCita: number, data: CitaUpdate) {
  return proxyFetch<CitaRead>(`/citas/${idCita}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function fetchSlotsDisponibles() {
  return proxyFetch<DisponibilidadRead[]>("/disponibilidad/?solo_disponibles=true");
}

export function fetchAlumnos(nombre?: string) {
  return proxyFetch<AlumnoRead[]>(`/alumnos/${qs({ nombre })}`);
}

export function fetchAlumnoById(idAlumno: number) {
  return proxyFetch<AlumnoRead>(`/alumnos/${idAlumno}`);
}

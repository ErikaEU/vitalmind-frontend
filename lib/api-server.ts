import "server-only";
import { getAuthToken } from "@/lib/auth";
import { ApiError, parseJsonResponse, qs } from "@/lib/http";
import type {
  AlumnoCreate,
  AlumnoRead,
  AlumnoUpdate,
  CitaCreate,
  CitaRead,
  CitaUpdate,
  DisponibilidadCreate,
  DisponibilidadRead,
  InstrumentoRead,
  InvitarAlumnosResponse,
  LoginRequest,
  ResultadoRead,
  ResultadoResumen,
  TamizajeConEstadistica,
  TamizajeCreate,
  TamizajeRead,
  TamizajeUpdate,
  TokenAccesoConAlumnoRead,
  TokenRegenerateRequest,
  TokenResponse,
} from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
  { auth = true }: { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");

  if (auth) {
    const token = await getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseJsonResponse<T>(res);
}

export { ApiError };

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function login(data: LoginRequest) {
  return backendFetch<TokenResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(data) },
    { auth: false }
  );
}

// ---------------------------------------------------------------------------
// Alumnos
// ---------------------------------------------------------------------------

export function listAlumnos(params?: { codigo?: string; nombre?: string; estado?: string }) {
  return backendFetch<AlumnoRead[]>(`/alumnos/${qs(params)}`);
}

export function getAlumno(idAlumno: number) {
  return backendFetch<AlumnoRead>(`/alumnos/${idAlumno}`);
}

export function crearAlumno(data: AlumnoCreate) {
  return backendFetch<AlumnoRead>("/alumnos/", { method: "POST", body: JSON.stringify(data) });
}

export function actualizarAlumno(idAlumno: number, data: AlumnoUpdate) {
  return backendFetch<AlumnoRead>(`/alumnos/${idAlumno}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Instrumentos
// ---------------------------------------------------------------------------

export function listInstrumentos() {
  return backendFetch<InstrumentoRead[]>("/instrumentos/");
}

// ---------------------------------------------------------------------------
// Tamizajes
// ---------------------------------------------------------------------------

export function listTamizajes(estado?: string) {
  return backendFetch<TamizajeRead[]>(`/tamizajes/${qs({ estado })}`);
}

export function crearTamizaje(data: TamizajeCreate) {
  return backendFetch<TamizajeRead>("/tamizajes/", { method: "POST", body: JSON.stringify(data) });
}

export function actualizarTamizaje(idTamizaje: number, data: TamizajeUpdate) {
  return backendFetch<TamizajeRead>(`/tamizajes/${idTamizaje}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function activarTamizaje(idTamizaje: number) {
  return backendFetch<TamizajeRead>(`/tamizajes/${idTamizaje}/activar`, { method: "POST" });
}

export function invitarAlumnos(idTamizaje: number, idsAlumno: number[]) {
  return backendFetch<InvitarAlumnosResponse>(`/tamizajes/${idTamizaje}/invitar`, {
    method: "POST",
    body: JSON.stringify(idsAlumno),
  });
}

export function regenerarToken(data: TokenRegenerateRequest) {
  return backendFetch<{ detail: string }>("/tamizajes/tokens/regenerar", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function estadisticasTamizaje(idTamizaje: number) {
  return backendFetch<TamizajeConEstadistica>(`/tamizajes/${idTamizaje}/estadisticas`);
}

export function listTokensTamizaje(idTamizaje: number) {
  return backendFetch<TokenAccesoConAlumnoRead[]>(`/tamizajes/${idTamizaje}/tokens`);
}

// ---------------------------------------------------------------------------
// Resultados
// ---------------------------------------------------------------------------

export function listResultadosPorTamizaje(idTamizaje: number, nivelRiesgo?: string) {
  return backendFetch<ResultadoResumen[]>(
    `/resultados/tamizaje/${idTamizaje}${qs({ nivel_riesgo: nivelRiesgo })}`
  );
}

export function getResultado(idResultado: number) {
  return backendFetch<ResultadoRead>(`/resultados/${idResultado}`);
}

export function interpretarIA(idResultado: number) {
  return backendFetch<ResultadoRead>("/resultados/interpretar-ia", {
    method: "POST",
    body: JSON.stringify({ id_resultado: idResultado }),
  });
}

// ---------------------------------------------------------------------------
// Disponibilidad
// ---------------------------------------------------------------------------

export function listSlots(params?: {
  fecha_desde?: string;
  fecha_hasta?: string;
  solo_disponibles?: boolean;
}) {
  return backendFetch<DisponibilidadRead[]>(`/disponibilidad/${qs(params)}`);
}

export function crearSlot(data: DisponibilidadCreate) {
  return backendFetch<DisponibilidadRead>("/disponibilidad/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function eliminarSlot(idSlot: number) {
  return backendFetch<void>(`/disponibilidad/${idSlot}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Citas
// ---------------------------------------------------------------------------

export function listCitas() {
  return backendFetch<CitaRead[]>("/citas/");
}

export function crearCita(data: CitaCreate) {
  return backendFetch<CitaRead>("/citas/", { method: "POST", body: JSON.stringify(data) });
}

export function actualizarCita(idCita: number, data: CitaUpdate) {
  return backendFetch<CitaRead>(`/citas/${idCita}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

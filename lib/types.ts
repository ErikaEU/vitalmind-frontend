/**
 * Tipos TypeScript espejo de los schemas Pydantic en app/schemas/*.py del backend.
 * Mantener sincronizado manualmente — no hay generación automática desde OpenAPI.
 */

// ---------------------------------------------------------------------------
// Enums de negocio (documentados como comentarios en los modelos SQLAlchemy)
// ---------------------------------------------------------------------------

export type Rol = "psicologa" | "administrador";

export type EstadoAlumno = "activo" | "inactivo" | "desertor" | "egresado";

export type EstadoTamizaje = "borrador" | "activo" | "cerrado" | "anulado";

export type EstadoTokenAcceso = "pendiente" | "usado" | "expirado" | "anulado";

export type EstadoSesion = "en_progreso" | "enviada";

export type EstadoCalculo = "pendiente" | "completado" | "error";

export type NivelRiesgo = "critico" | "monitoreo" | "normal";

export type EstadoCita = "programada" | "completada" | "cancelada" | "no_asistio";

export type TipoRespuesta = "dicotomica" | "tricotomica";

// ---------------------------------------------------------------------------
// auth.py
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  nombre_completo: string;
  rol: Rol;
}

// ---------------------------------------------------------------------------
// alumno.py
// ---------------------------------------------------------------------------

export interface AlumnoCreate {
  codigo_matricula: string;
  dni: string;
  nombre_completo: string;
  email_institucional: string;
  anio_ingreso?: number | null;
  ciclo_actual?: number | null;
}

export interface AlumnoUpdate {
  nombre_completo?: string;
  email_institucional?: string;
  ciclo_actual?: number;
  estado?: EstadoAlumno;
}

export interface AlumnoRead {
  id_alumno: number;
  codigo_matricula: string;
  dni: string;
  nombre_completo: string;
  email_institucional: string;
  anio_ingreso: number | null;
  ciclo_actual: number | null;
  estado: EstadoAlumno;
}

// ---------------------------------------------------------------------------
// instrumento.py
// ---------------------------------------------------------------------------

export interface InstrumentoRead {
  id_instrumento: number;
  nombre: string;
  descripcion: string | null;
  version: string | null;
  tipo_calificacion: string;
  activo: boolean;
}

// ---------------------------------------------------------------------------
// tamizaje.py
// ---------------------------------------------------------------------------

export interface TamizajeCreate {
  id_instrumento: number;
  nombre: string;
  descripcion?: string | null;
  fecha_limite_respuesta: string; // ISO datetime
}

export interface TamizajeUpdate {
  nombre?: string;
  descripcion?: string;
  fecha_limite_respuesta?: string;
  estado?: EstadoTamizaje;
}

export interface TamizajeRead {
  id_tamizaje: number;
  id_personal_creador: number;
  id_instrumento: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
  fecha_limite_respuesta: string;
  estado: EstadoTamizaje;
}

export interface TamizajeConEstadistica extends TamizajeRead {
  total_invitados: number;
  total_respondidos: number;
  total_pendientes: number;
}

/** Respuesta de POST /tamizajes/{id}/invitar (app/services/tamizaje_service.py::invitar_alumnos). */
export interface InvitarAlumnosResponse {
  enviados: number[];
  fallidos: { id_alumno: number; motivo: string }[];
}

// ---------------------------------------------------------------------------
// token_acceso.py
// ---------------------------------------------------------------------------

export interface TokenAccesoRead {
  id_token: number;
  id_tamizaje: number;
  id_alumno: number;
  estado: EstadoTokenAcceso;
  fecha_expiracion: string;
  fecha_uso: string | null;
}

export interface TokenRegenerateRequest {
  id_tamizaje: number;
  id_alumno: number;
}

export interface TokenAccesoConAlumnoRead {
  id_token: number;
  id_alumno: number;
  nombre_alumno: string;
  codigo_matricula: string;
  estado: EstadoTokenAcceso;
  fecha_expiracion: string;
  fecha_uso: string | null;
}

// ---------------------------------------------------------------------------
// sesion_respuesta.py
// ---------------------------------------------------------------------------

export interface OpcionResumenRead {
  id_opcion: number;
  texto_opcion: string;
  orden: number;
}

export interface PreguntaResumenRead {
  id_pregunta: number;
  orden: number;
  enunciado: string;
  dimension: string | null;
  tipo_respuesta: TipoRespuesta;
  opciones: OpcionResumenRead[];
}

export interface SesionInicioRead {
  id_sesion: number;
  nombre_instrumento: string;
  preguntas: PreguntaResumenRead[];
}

export interface RespuestaItemRequest {
  id_pregunta: number;
  id_opcion_seleccionada?: number | null;
  valor_texto?: string | null;
}

export interface RespuestaEnvioRequest {
  id_sesion: number;
  respuestas: RespuestaItemRequest[];
}

export interface SesionEstadoRead {
  id_sesion: number;
  estado: EstadoSesion;
  fecha_inicio: string;
  fecha_envio: string | null;
}

// ---------------------------------------------------------------------------
// resultado.py
// ---------------------------------------------------------------------------

export interface ResultadoResumen {
  id_resultado: number;
  id_alumno: number;
  nombre_alumno: string;
  codigo_matricula: string;
  nombre_perfil: string | null;
  nivel_riesgo: NivelRiesgo | null;
  puntaje_emotividad: number | null;
  puntaje_actividad: number | null;
  puntaje_resonancia: number | null;
  alerta_emotividad_alta: string;
  estado_calculo: EstadoCalculo;
  fecha_calculo: string | null;
}

export interface ResultadoRead extends ResultadoResumen {
  id_tamizaje: number;
  puntaje_total: number | null;
  ia_diagnostico: string | null;
  ia_caracteristicas: string | null;
  ia_recomendaciones: string | null;
}

export interface SolicitudInterpretacionIA {
  id_resultado: number;
}

// ---------------------------------------------------------------------------
// disponibilidad.py
// ---------------------------------------------------------------------------

export interface DisponibilidadCreate {
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
}

export interface DisponibilidadRead {
  id_slot: number;
  id_personal: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

// ---------------------------------------------------------------------------
// cita.py
// ---------------------------------------------------------------------------

export interface CitaCreate {
  id_slot: number;
  id_alumno: number;
  id_resultado_origen?: number | null;
  motivo?: string | null;
}

export interface CitaUpdate {
  estado?: EstadoCita;
  notas_sesion?: string;
}

export interface CitaRead {
  id_cita: number;
  id_slot: number;
  id_alumno: number;
  nombre_alumno: string;
  id_personal: number;
  id_resultado_origen: number | null;
  motivo: string | null;
  estado: EstadoCita;
  notas_sesion: string | null;
  fecha_creacion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

// ---------------------------------------------------------------------------
// Sesión de administrador — payload del JWT (app/utils/security.py)
// ---------------------------------------------------------------------------

export interface AdminSession {
  id_personal: number;
  rol: Rol;
  nombre_completo: string;
}

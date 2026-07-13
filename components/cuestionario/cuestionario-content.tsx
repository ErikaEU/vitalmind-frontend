import { CuestionarioForm } from "@/components/cuestionario/cuestionario-form";
import { ErrorScreen } from "@/components/cuestionario/error-screen";
import type { SesionInicioRead } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

async function iniciarCuestionario(
  token: string
): Promise<{ data: SesionInicioRead } | { error: string }> {
  try {
    const res = await fetch(
      `${API_URL}/cuestionario/iniciar?token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: body.detail ?? "No se pudo iniciar el cuestionario." };
    }
    return { data: body as SesionInicioRead };
  } catch {
    return { error: "No se pudo conectar con el servidor. Intenta nuevamente en unos minutos." };
  }
}

/**
 * Componente async separado de page.tsx a propósito: al envolverlo en
 * <Suspense> desde la página, Next.js puede transmitir el fallback de carga
 * de inmediato mientras este fetch (potencialmente lento por un cold start
 * de Render) sigue en curso.
 */
export async function CuestionarioContent({ token }: { token: string }) {
  const result = await iniciarCuestionario(token);

  if ("error" in result) {
    return <ErrorScreen message={result.error} />;
  }

  return (
    <>
      <header className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">VitalMind — FISI UNMSM</p>
        <h1 className="text-2xl font-semibold tracking-tight">{result.data.nombre_instrumento}</h1>
        <p className="text-sm text-muted-foreground">
          Responde cada pregunta con sinceridad. Tus respuestas son confidenciales y serán
          revisadas únicamente por el equipo de bienestar universitario.
        </p>
      </header>
      <CuestionarioForm sesion={result.data} />
    </>
  );
}

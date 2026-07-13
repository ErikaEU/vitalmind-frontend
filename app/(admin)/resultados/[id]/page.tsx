import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InterpretarIAButton } from "@/components/admin/interpretar-ia-button";
import { getResultado, ApiError } from "@/lib/api-server";
import type { NivelRiesgo } from "@/lib/types";

const NIVEL_RIESGO_STYLE: Record<NivelRiesgo, string> = {
  critico: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  monitoreo: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  normal: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultadoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idResultado = Number(id);

  let resultado;
  try {
    resultado = await getResultado(idResultado);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{resultado.nombre_alumno}</h1>
            {resultado.nivel_riesgo && (
              <Badge className={NIVEL_RIESGO_STYLE[resultado.nivel_riesgo]} variant="outline">
                {resultado.nivel_riesgo}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {resultado.codigo_matricula} · Tamizaje #{resultado.id_tamizaje}
          </p>
        </div>

        <Button asChild size="sm">
          <Link
            href={`/citas?id_alumno=${resultado.id_alumno}&id_resultado=${resultado.id_resultado}`}
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar cita
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Emotividad" value={resultado.puntaje_emotividad} />
        <StatCard label="Actividad" value={resultado.puntaje_actividad} />
        <StatCard label="Resonancia" value={resultado.puntaje_resonancia} />
        <StatCard label="Total" value={resultado.puntaje_total} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil psicológico</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Perfil: </span>
            {resultado.nombre_perfil ?? "No calculado"}
          </p>
          <p>
            <span className="text-muted-foreground">Estado de cálculo: </span>
            <span className="capitalize">{resultado.estado_calculo}</span>
          </p>
          {resultado.alerta_emotividad_alta === "true" && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ Alerta por emotividad alta (E &gt; 75)
            </p>
          )}
          {resultado.fecha_calculo && (
            <p className="text-xs text-muted-foreground">
              Calculado el {format(new Date(resultado.fecha_calculo), "PPPp", { locale: es })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Interpretación IA</CardTitle>
          <InterpretarIAButton idResultado={resultado.id_resultado} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {!resultado.ia_diagnostico && !resultado.ia_caracteristicas && !resultado.ia_recomendaciones && (
            <p className="text-muted-foreground">
              Aún no se ha generado una interpretación IA para este resultado.
            </p>
          )}
          {resultado.ia_diagnostico && (
            <IaSection title="Diagnóstico" content={resultado.ia_diagnostico} />
          )}
          {resultado.ia_caracteristicas && (
            <>
              <Separator />
              <IaSection title="Características" content={resultado.ia_caracteristicas} />
            </>
          )}
          {resultado.ia_recomendaciones && (
            <>
              <Separator />
              <IaSection title="Recomendaciones" content={resultado.ia_recomendaciones} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-semibold">{value ?? "—"}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function IaSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="mb-1 font-medium">{title}</p>
      <p className="whitespace-pre-line text-muted-foreground">{content}</p>
    </div>
  );
}

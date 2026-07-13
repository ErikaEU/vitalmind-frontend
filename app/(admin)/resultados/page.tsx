import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ResultadosTable } from "@/components/admin/resultados-table";
import { listTamizajes } from "@/lib/api-server";
import type { EstadoTamizaje } from "@/lib/types";

const ESTADO_VARIANT: Record<EstadoTamizaje, "default" | "secondary" | "destructive" | "outline"> = {
  borrador: "outline",
  activo: "default",
  cerrado: "secondary",
  anulado: "destructive",
};

interface PageProps {
  searchParams: Promise<{ id_tamizaje?: string }>;
}

export default async function ResultadosPage({ searchParams }: PageProps) {
  const { id_tamizaje } = await searchParams;
  const idTamizaje = id_tamizaje ? Number(id_tamizaje) : undefined;
  const tamizajes = await listTamizajes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resultados</h1>
        <p className="text-sm text-muted-foreground">
          Consulta los resultados de un tamizaje, filtrables por nivel de riesgo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seleccionar tamizaje</CardTitle>
        </CardHeader>
        <CardContent>
          {tamizajes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay tamizajes creados.</p>
          ) : (
            <form method="GET" className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="id_tamizaje">Tamizaje</Label>
                <select
                  id="id_tamizaje"
                  name="id_tamizaje"
                  defaultValue={idTamizaje}
                  className="flex h-9 w-72 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                >
                  {tamizajes.map((t) => (
                    <option key={t.id_tamizaje} value={t.id_tamizaje}>
                      {t.nombre} ({t.estado})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Ver resultados</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {idTamizaje ? (
        <ResultadosTable idTamizaje={idTamizaje} />
      ) : (
        tamizajes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tamizajes</CardTitle>
              <CardDescription>Elige uno para ver sus resultados.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y">
                {tamizajes.map((t) => (
                  <li key={t.id_tamizaje} className="py-2">
                    <Link
                      href={`/resultados?id_tamizaje=${t.id_tamizaje}`}
                      className="flex items-center justify-between gap-2 text-sm hover:underline"
                    >
                      <span className="font-medium">{t.nombre}</span>
                      <Badge variant={ESTADO_VARIANT[t.estado]} className="capitalize">
                        {t.estado}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

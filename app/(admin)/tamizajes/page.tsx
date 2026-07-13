import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TamizajeForm } from "@/components/admin/tamizaje-form";
import { listInstrumentos, listTamizajes } from "@/lib/api-server";
import type { EstadoTamizaje } from "@/lib/types";

const ESTADO_VARIANT: Record<EstadoTamizaje, "default" | "secondary" | "destructive" | "outline"> = {
  borrador: "outline",
  activo: "default",
  cerrado: "secondary",
  anulado: "destructive",
};

export default async function TamizajesPage() {
  const [tamizajes, instrumentos] = await Promise.all([listTamizajes(), listInstrumentos()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tamizajes</h1>
        <p className="text-sm text-muted-foreground">
          Crea un tamizaje, actívalo y luego invita alumnos desde su página de detalle.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Nuevo tamizaje</CardTitle>
            <CardDescription>Se crea en estado &quot;borrador&quot;.</CardDescription>
          </CardHeader>
          <CardContent>
            <TamizajeForm instrumentos={instrumentos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Todos los tamizajes</CardTitle>
            <CardDescription>{tamizajes.length} en total</CardDescription>
          </CardHeader>
          <CardContent>
            {tamizajes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay tamizajes creados.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {tamizajes.map((t) => (
                  <li key={t.id_tamizaje} className="py-2">
                    <Link
                      href={`/tamizajes/${t.id_tamizaje}`}
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
            )}
          </CardContent>
        </Card>
      </div>

      {tamizajes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Fecha límite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tamizajes.map((t) => (
                  <TableRow key={t.id_tamizaje}>
                    <TableCell className="font-medium">
                      <Link href={`/tamizajes/${t.id_tamizaje}`} className="hover:underline">
                        {t.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ESTADO_VARIANT[t.estado]} className="capitalize">
                        {t.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(t.fecha_creacion), "PPp", { locale: es })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(t.fecha_limite_respuesta), "PPp", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

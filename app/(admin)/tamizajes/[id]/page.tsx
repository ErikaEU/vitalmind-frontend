import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActivarTamizajeButton } from "@/components/admin/activar-tamizaje-button";
import { InvitarAlumnosForm } from "@/components/admin/invitar-alumnos-form";
import { TamizajeEditDialog } from "@/components/admin/tamizaje-edit-dialog";
import { AnularTamizajeButton } from "@/components/admin/anular-tamizaje-button";
import { RegenerarTokenButton } from "@/components/admin/regenerar-token-button";
import { estadisticasTamizaje, listTokensTamizaje, ApiError } from "@/lib/api-server";
import type { EstadoTamizaje, EstadoTokenAcceso } from "@/lib/types";

const ESTADO_VARIANT: Record<EstadoTamizaje, "default" | "secondary" | "destructive" | "outline"> = {
  borrador: "outline",
  activo: "default",
  cerrado: "secondary",
  anulado: "destructive",
};

const TOKEN_ESTADO_VARIANT: Record<EstadoTokenAcceso, "default" | "secondary" | "destructive" | "outline"> = {
  pendiente: "outline",
  usado: "default",
  expirado: "secondary",
  anulado: "destructive",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TamizajeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idTamizaje = Number(id);

  let tamizaje;
  try {
    tamizaje = await estadisticasTamizaje(idTamizaje);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const invitados = tamizaje.total_invitados > 0 ? await listTokensTamizaje(idTamizaje) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{tamizaje.nombre}</h1>
            <Badge variant={ESTADO_VARIANT[tamizaje.estado]} className="capitalize">
              {tamizaje.estado}
            </Badge>
          </div>
          {tamizaje.descripcion && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{tamizaje.descripcion}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Fecha límite:{" "}
            {format(new Date(tamizaje.fecha_limite_respuesta), "PPPp", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tamizaje.estado === "borrador" && (
            <>
              <TamizajeEditDialog tamizaje={tamizaje} />
              <ActivarTamizajeButton idTamizaje={tamizaje.id_tamizaje} />
              <AnularTamizajeButton idTamizaje={tamizaje.id_tamizaje} />
            </>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/resultados?id_tamizaje=${tamizaje.id_tamizaje}`}>
              <BarChart3 className="h-4 w-4" />
              Ver resultados
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Invitados" value={tamizaje.total_invitados} />
        <StatCard label="Respondidos" value={tamizaje.total_respondidos} />
        <StatCard label="Pendientes" value={tamizaje.total_pendientes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitar alumnos</CardTitle>
          <CardDescription>
            {tamizaje.estado === "activo"
              ? "Busca alumnos por nombre y envíales el enlace de acceso al cuestionario."
              : "El tamizaje debe estar activo para poder invitar alumnos."}
          </CardDescription>
        </CardHeader>
        {tamizaje.estado === "activo" && (
          <CardContent>
            <InvitarAlumnosForm idTamizaje={tamizaje.id_tamizaje} />
          </CardContent>
        )}
      </Card>

      {invitados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invitados</CardTitle>
            <CardDescription>
              Estado del token de acceso de cada alumno invitado. Puedes regenerarlo si expiró o
              se anuló.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Estado del token</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitados.map((inv) => (
                  <TableRow key={inv.id_token}>
                    <TableCell className="font-medium">{inv.nombre_alumno}</TableCell>
                    <TableCell>{inv.codigo_matricula}</TableCell>
                    <TableCell>
                      <Badge variant={TOKEN_ESTADO_VARIANT[inv.estado]} className="capitalize">
                        {inv.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(inv.fecha_expiracion), "PPp", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.estado !== "usado" && (
                        <RegenerarTokenButton
                          idTamizaje={tamizaje.id_tamizaje}
                          idAlumno={inv.id_alumno}
                        />
                      )}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

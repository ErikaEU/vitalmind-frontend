"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination } from "@/components/admin/pagination";
import { fetchResultadosPorTamizaje } from "@/lib/api-client";
import { ApiError } from "@/lib/http";
import type { NivelRiesgo } from "@/lib/types";

const NIVEL_RIESGO_STYLE: Record<NivelRiesgo, string> = {
  critico: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  monitoreo: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  normal: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

const PAGE_SIZE = 15;

export function ResultadosTable({ idTamizaje }: { idTamizaje: number }) {
  const [nivelRiesgo, setNivelRiesgo] = useState<string>("todos");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["resultados", idTamizaje, nivelRiesgo],
    queryFn: () =>
      fetchResultadosPorTamizaje(idTamizaje, nivelRiesgo === "todos" ? undefined : nivelRiesgo),
  });

  const totalPages = Math.max(1, Math.ceil((data?.length ?? 0) / PAGE_SIZE));
  const pageItems = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  function handleNivelRiesgoChange(value: string) {
    setNivelRiesgo(value);
    setPage(1);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Resultados del tamizaje #{idTamizaje}</CardTitle>
        <Select value={nivelRiesgo} onValueChange={handleNivelRiesgoChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Nivel de riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            <SelectItem value="critico">Crítico</SelectItem>
            <SelectItem value="monitoreo">Monitoreo</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando resultados...
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof ApiError ? error.message : "No se pudieron cargar los resultados."}
            </AlertDescription>
          </Alert>
        )}

        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay resultados para este filtro.
          </p>
        )}

        {data && data.length > 0 && (
          <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>E / A / R</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((r) => (
                <TableRow key={r.id_resultado}>
                  <TableCell className="font-medium">{r.nombre_alumno}</TableCell>
                  <TableCell>{r.codigo_matricula}</TableCell>
                  <TableCell>{r.nombre_perfil ?? "—"}</TableCell>
                  <TableCell>
                    {r.nivel_riesgo ? (
                      <Badge className={NIVEL_RIESGO_STYLE[r.nivel_riesgo]} variant="outline">
                        {r.nivel_riesgo}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.puntaje_emotividad ?? "—"} / {r.puntaje_actividad ?? "—"} /{" "}
                    {r.puntaje_resonancia ?? "—"}
                  </TableCell>
                  <TableCell className="capitalize">{r.estado_calculo}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/resultados/${r.id_resultado}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

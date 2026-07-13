import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlumnoFormDialog } from "@/components/admin/alumno-form-dialog";
import { AlumnoEditDialog } from "@/components/admin/alumno-edit-dialog";
import { Pagination } from "@/components/admin/pagination";
import { listAlumnos } from "@/lib/api-server";
import type { EstadoAlumno } from "@/lib/types";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ nombre?: string; codigo?: string; estado?: string; page?: string }>;
}

const ESTADO_VARIANT: Record<EstadoAlumno, "default" | "secondary" | "destructive" | "outline"> = {
  activo: "default",
  inactivo: "secondary",
  desertor: "destructive",
  egresado: "outline",
};

export default async function AlumnosPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const alumnos = await listAlumnos(filters);

  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(alumnos.length / PAGE_SIZE));
  const pageItems = alumnos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function hrefForPage(target: number) {
    const params = new URLSearchParams();
    if (filters.nombre) params.set("nombre", filters.nombre);
    if (filters.codigo) params.set("codigo", filters.codigo);
    if (filters.estado) params.set("estado", filters.estado);
    params.set("page", String(target));
    return `/alumnos?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alumnos</h1>
          <p className="text-sm text-muted-foreground">Padrón de alumnos del programa.</p>
        </div>
        <AlumnoFormDialog />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="nombre">
                Nombre
              </label>
              <Input id="nombre" name="nombre" defaultValue={filters.nombre} className="w-56" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="codigo">
                Código
              </label>
              <Input id="codigo" name="codigo" defaultValue={filters.codigo} className="w-40" />
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{alumnos.length} alumnos</CardTitle>
        </CardHeader>
        <CardContent>
          {alumnos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No se encontraron alumnos con estos filtros.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((alumno) => (
                    <TableRow key={alumno.id_alumno}>
                      <TableCell className="font-medium">{alumno.nombre_completo}</TableCell>
                      <TableCell>{alumno.codigo_matricula}</TableCell>
                      <TableCell>{alumno.dni}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {alumno.email_institucional}
                      </TableCell>
                      <TableCell>{alumno.ciclo_actual ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={ESTADO_VARIANT[alumno.estado]} className="capitalize">
                          {alumno.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlumnoEditDialog alumno={alumno} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

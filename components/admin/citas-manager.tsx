"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Pagination } from "@/components/admin/pagination";
import {
  fetchActualizarCita,
  fetchAlumnoById,
  fetchAlumnos,
  fetchCitas,
  fetchCrearCita,
  fetchSlotsDisponibles,
} from "@/lib/api-client";
import { ApiError } from "@/lib/http";
import type { AlumnoRead, EstadoCita } from "@/lib/types";

const CITAS_PAGE_SIZE = 10;

const ESTADO_LABEL: Record<EstadoCita, string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

const ESTADO_VARIANT: Record<EstadoCita, "default" | "secondary" | "destructive" | "outline"> = {
  programada: "default",
  completada: "secondary",
  cancelada: "destructive",
  no_asistio: "outline",
};

const schema = z.object({
  id_slot: z.coerce.number().int().positive("Selecciona un horario."),
  id_alumno: z.coerce.number().int().positive("Selecciona un alumno."),
  motivo: z.string().trim().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface CitasManagerProps {
  prefillIdAlumno?: number;
  prefillIdResultado?: number;
}

export function CitasManager({ prefillIdAlumno, prefillIdResultado }: CitasManagerProps) {
  const queryClient = useQueryClient();

  const citasQuery = useQuery({ queryKey: ["citas"], queryFn: fetchCitas });
  const slotsQuery = useQuery({ queryKey: ["slots-disponibles"], queryFn: fetchSlotsDisponibles });

  const prefillAlumnoQuery = useQuery({
    queryKey: ["alumno", prefillIdAlumno],
    queryFn: () => fetchAlumnoById(prefillIdAlumno!),
    enabled: Boolean(prefillIdAlumno),
  });

  const [alumnoBusqueda, setAlumnoBusqueda] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<AlumnoRead | null>(null);

  const alumnosQuery = useQuery({
    queryKey: ["alumnos-search", alumnoBusqueda],
    queryFn: () => fetchAlumnos(alumnoBusqueda),
    enabled: alumnoBusqueda.trim().length >= 2,
  });

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_slot: undefined,
      id_alumno: prefillIdAlumno,
      motivo: "",
    },
  });

  const alumnoActivo = alumnoSeleccionado ?? prefillAlumnoQuery.data ?? null;

  const crearCitaMutation = useMutation({
    mutationFn: (values: FormOutput) =>
      fetchCrearCita({
        id_slot: values.id_slot,
        id_alumno: values.id_alumno,
        motivo: values.motivo || undefined,
        id_resultado_origen: prefillIdResultado,
      }),
    onSuccess: () => {
      toast.success("Cita agendada.");
      form.reset({ id_slot: undefined, id_alumno: undefined, motivo: "" });
      setAlumnoSeleccionado(null);
      setAlumnoBusqueda("");
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["slots-disponibles"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "No se pudo agendar la cita.");
    },
  });

  const actualizarCitaMutation = useMutation({
    mutationFn: ({ idCita, estado }: { idCita: number; estado: EstadoCita }) =>
      fetchActualizarCita(idCita, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      toast.success("Cita actualizada.");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar la cita.");
    },
  });

  const slotOptions = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);

  const fechasConCita = useMemo(() => {
    const set = new Set<string>();
    for (const cita of citasQuery.data ?? []) set.add(cita.fecha);
    return set;
  }, [citasQuery.data]);

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  const citasFiltradas = useMemo(() => {
    const all = citasQuery.data ?? [];
    return selectedDateKey ? all.filter((c) => c.fecha === selectedDateKey) : all;
  }, [citasQuery.data, selectedDateKey]);

  const totalPages = Math.max(1, Math.ceil(citasFiltradas.length / CITAS_PAGE_SIZE));
  const citasPagina = citasFiltradas.slice((page - 1) * CITAS_PAGE_SIZE, page * CITAS_PAGE_SIZE);

  function handleSelectDate(date: Date | undefined) {
    setSelectedDate((prev) => {
      const next = date && prev && format(date, "yyyy-MM-dd") === format(prev, "yyyy-MM-dd")
        ? undefined
        : date;
      return next;
    });
    setPage(1);
  }

  function onSubmit(values: FormOutput) {
    crearCitaMutation.mutate(values);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva cita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Alumno</Label>
              {alumnoActivo ? (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="flex-1">
                    {alumnoActivo.nombre_completo}{" "}
                    <span className="text-muted-foreground">({alumnoActivo.codigo_matricula})</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAlumnoSeleccionado(null);
                      form.setValue("id_alumno", undefined as unknown as number);
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={alumnoBusqueda}
                    onChange={(e) => setAlumnoBusqueda(e.target.value)}
                    placeholder="Buscar alumno por nombre..."
                    className="pl-8"
                  />
                  {alumnoBusqueda.trim().length >= 2 && (
                    <div className="mt-1 max-h-48 overflow-y-auto rounded-md border">
                      {alumnosQuery.isFetching && (
                        <p className="p-3 text-sm text-muted-foreground">Buscando...</p>
                      )}
                      {alumnosQuery.data?.map((alumno) => (
                        <button
                          type="button"
                          key={alumno.id_alumno}
                          onClick={() => {
                            setAlumnoSeleccionado(alumno);
                            form.setValue("id_alumno", alumno.id_alumno, { shouldValidate: true });
                          }}
                          className="flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted/50"
                        >
                          <span>{alumno.nombre_completo}</span>
                          <span className="text-xs text-muted-foreground">
                            {alumno.codigo_matricula}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {form.formState.errors.id_alumno && (
                <p className="text-sm text-destructive">{form.formState.errors.id_alumno.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_slot">Horario disponible</Label>
              <Select
                value={form.watch("id_slot") ? String(form.watch("id_slot")) : ""}
                onValueChange={(value) =>
                  form.setValue("id_slot", Number(value), { shouldValidate: true })
                }
              >
                <SelectTrigger id="id_slot" className="w-full">
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent>
                  {slotOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No hay slots disponibles.
                    </div>
                  )}
                  {slotOptions.map((slot) => (
                    <SelectItem key={slot.id_slot} value={String(slot.id_slot)}>
                      {format(new Date(`${slot.fecha}T00:00:00`), "PPP", { locale: es })} ·{" "}
                      {slot.hora_inicio.slice(0, 5)}–{slot.hora_fin.slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.id_slot && (
                <p className="text-sm text-destructive">{form.formState.errors.id_slot.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea id="motivo" {...form.register("motivo")} rows={2} />
            </div>

            <Button type="submit" className="w-fit" disabled={crearCitaMutation.isPending}>
              {crearCitaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agendar cita
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              locale={es}
              selected={selectedDate}
              onSelect={handleSelectDate}
              modifiers={{
                hasCita: (date) => fechasConCita.has(format(date, "yyyy-MM-dd")),
              }}
              modifiersClassNames={{
                hasCita: "font-semibold underline decoration-primary decoration-2 underline-offset-4",
              }}
            />
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => handleSelectDate(undefined)}
              >
                Ver todas las fechas
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Citas
              {selectedDate && (
                <span className="ml-2 font-normal text-muted-foreground">
                  · {format(selectedDate, "PPP", { locale: es })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {citasQuery.isLoading && (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando citas...
              </div>
            )}

            {citasQuery.data && citasFiltradas.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {selectedDate ? "No hay citas en esta fecha." : "No hay citas registradas."}
              </p>
            )}

            {citasPagina.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alumno</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Cambiar estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {citasPagina.map((cita) => (
                      <TableRow key={cita.id_cita}>
                        <TableCell className="font-medium">{cita.nombre_alumno}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(`${cita.fecha}T00:00:00`), "PP", { locale: es })} ·{" "}
                          {cita.hora_inicio.slice(0, 5)}–{cita.hora_fin.slice(0, 5)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {cita.motivo ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ESTADO_VARIANT[cita.estado]}>
                            {ESTADO_LABEL[cita.estado]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={cita.estado}
                            onValueChange={(value) =>
                              actualizarCitaMutation.mutate({
                                idCita: cita.id_cita,
                                estado: value as EstadoCita,
                              })
                            }
                          >
                            <SelectTrigger className="ml-auto w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(ESTADO_LABEL) as EstadoCita[]).map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {ESTADO_LABEL[estado]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
      </div>
    </div>
  );
}

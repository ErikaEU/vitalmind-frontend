"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actualizarAlumnoAction } from "@/app/(admin)/alumnos/actions";
import type { AlumnoRead, EstadoAlumno } from "@/lib/types";

const ESTADOS: EstadoAlumno[] = ["activo", "inactivo", "desertor", "egresado"];

const schema = z.object({
  nombre_completo: z.string().trim().min(1, "El nombre es obligatorio."),
  email_institucional: z.email("Ingresa un correo válido."),
  ciclo_actual: z.coerce.number().int().optional(),
  estado: z.enum(ESTADOS),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function AlumnoEditDialog({ alumno }: { alumno: AlumnoRead }) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_completo: alumno.nombre_completo,
      email_institucional: alumno.email_institucional,
      ciclo_actual: alumno.ciclo_actual ?? undefined,
      estado: alumno.estado,
    },
  });

  async function onSubmit(values: FormOutput) {
    const result = await actualizarAlumnoAction(alumno.id_alumno, values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Alumno actualizado.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar alumno">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar alumno</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre completo</Label>
            <Input id="nombre_completo" {...form.register("nombre_completo")} />
            {form.formState.errors.nombre_completo && (
              <p className="text-sm text-destructive">
                {form.formState.errors.nombre_completo.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_institucional">Correo institucional</Label>
            <Input id="email_institucional" type="email" {...form.register("email_institucional")} />
            {form.formState.errors.email_institucional && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email_institucional.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ciclo_actual">Ciclo actual</Label>
              <Input id="ciclo_actual" type="number" {...form.register("ciclo_actual")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={form.watch("estado")}
                onValueChange={(value) =>
                  form.setValue("estado", value as EstadoAlumno, { shouldValidate: true })
                }
              >
                <SelectTrigger id="estado" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((estado) => (
                    <SelectItem key={estado} value={estado} className="capitalize">
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

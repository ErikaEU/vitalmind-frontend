"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { crearTamizajeAction } from "@/app/(admin)/tamizajes/actions";
import type { InstrumentoRead } from "@/lib/types";

const schema = z.object({
  id_instrumento: z.coerce.number().int().positive("Selecciona un instrumento."),
  nombre: z.string().trim().min(1, "El nombre es obligatorio."),
  descripcion: z.string().trim().optional(),
  fecha_limite_respuesta: z
    .string()
    .min(1, "Selecciona una fecha límite.")
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "La fecha límite debe ser futura.",
    }),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function TamizajeForm({ instrumentos }: { instrumentos: InstrumentoRead[] }) {
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_instrumento: instrumentos[0]?.id_instrumento,
      nombre: "",
      descripcion: "",
      fecha_limite_respuesta: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    try {
      await crearTamizajeAction({
        id_instrumento: values.id_instrumento,
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        fecha_limite_respuesta: new Date(values.fecha_limite_respuesta).toISOString(),
      });
    } catch (err) {
      // redirect() de Next.js lanza una excepción interna al navegar con éxito — no es un error real.
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      toast.error("No se pudo crear el tamizaje.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del tamizaje</Label>
        <Input id="nombre" {...form.register("nombre")} placeholder="Tamizaje 2026-I — Ingresantes" />
        {form.formState.errors.nombre && (
          <p className="text-sm text-destructive">{form.formState.errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea id="descripcion" {...form.register("descripcion")} rows={2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id_instrumento">Instrumento</Label>
          <Select
            value={form.watch("id_instrumento") ? String(form.watch("id_instrumento")) : ""}
            onValueChange={(value) =>
              form.setValue("id_instrumento", Number(value), { shouldValidate: true })
            }
          >
            <SelectTrigger id="id_instrumento" className="w-full">
              <SelectValue placeholder="Selecciona un instrumento" />
            </SelectTrigger>
            <SelectContent>
              {instrumentos.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No hay instrumentos activos.
                </div>
              )}
              {instrumentos.map((instrumento) => (
                <SelectItem
                  key={instrumento.id_instrumento}
                  value={String(instrumento.id_instrumento)}
                >
                  {instrumento.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.id_instrumento && (
            <p className="text-sm text-destructive">
              {form.formState.errors.id_instrumento.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_limite_respuesta">Fecha límite de respuesta</Label>
          <Input
            id="fecha_limite_respuesta"
            type="datetime-local"
            {...form.register("fecha_limite_respuesta")}
          />
          {form.formState.errors.fecha_limite_respuesta && (
            <p className="text-sm text-destructive">
              {form.formState.errors.fecha_limite_respuesta.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Crear tamizaje
      </Button>
    </form>
  );
}

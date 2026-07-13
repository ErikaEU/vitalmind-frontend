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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { actualizarTamizajeAction } from "@/app/(admin)/tamizajes/actions";
import type { TamizajeRead } from "@/lib/types";

const schema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio."),
  descripcion: z.string().trim().optional(),
  fecha_limite_respuesta: z
    .string()
    .min(1, "Selecciona una fecha límite.")
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "La fecha límite debe ser futura.",
    }),
});

type FormValues = z.infer<typeof schema>;

function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function TamizajeEditDialog({ tamizaje }: { tamizaje: TamizajeRead }) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: tamizaje.nombre,
      descripcion: tamizaje.descripcion ?? "",
      fecha_limite_respuesta: toDatetimeLocal(tamizaje.fecha_limite_respuesta),
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await actualizarTamizajeAction(tamizaje.id_tamizaje, {
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      fecha_limite_respuesta: new Date(values.fecha_limite_respuesta).toISOString(),
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Tamizaje actualizado.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tamizaje</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...form.register("nombre")} />
            {form.formState.errors.nombre && (
              <p className="text-sm text-destructive">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" rows={2} {...form.register("descripcion")} />
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

          <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearSlotAction } from "@/app/(admin)/disponibilidad/actions";

const schema = z
  .object({
    fecha: z.string().min(1, "Selecciona una fecha."),
    hora_inicio: z
      .string()
      .min(1, "Selecciona la hora de inicio.")
      .refine((v) => v >= "08:00" && v < "17:00", {
        message: "Debe estar entre 08:00 y 17:00.",
      }),
    hora_fin: z.string().min(1, "Selecciona la hora de fin."),
  })
  .refine((data) => data.hora_fin > data.hora_inicio, {
    message: "La hora de fin debe ser posterior a la de inicio.",
    path: ["hora_fin"],
  });

type FormValues = z.infer<typeof schema>;

export function DisponibilidadForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: "", hora_inicio: "", hora_fin: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await crearSlotAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Slot creado.");
    form.reset({ fecha: values.fecha, hora_inicio: "", hora_fin: "" });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" type="date" {...form.register("fecha")} />
        {form.formState.errors.fecha && (
          <p className="text-sm text-destructive">{form.formState.errors.fecha.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="hora_inicio">Hora inicio</Label>
        <Input id="hora_inicio" type="time" {...form.register("hora_inicio")} />
        {form.formState.errors.hora_inicio && (
          <p className="text-sm text-destructive">{form.formState.errors.hora_inicio.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="hora_fin">Hora fin</Label>
        <Input id="hora_fin" type="time" {...form.register("hora_fin")} />
        {form.formState.errors.hora_fin && (
          <p className="text-sm text-destructive">{form.formState.errors.hora_fin.message}</p>
        )}
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Agregar slot
      </Button>
    </form>
  );
}

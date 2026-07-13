"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearAlumnoAction } from "@/app/(admin)/alumnos/actions";

const schema = z.object({
  codigo_matricula: z.string().trim().min(1, "El código de matrícula es obligatorio."),
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos."),
  nombre_completo: z.string().trim().min(1, "El nombre es obligatorio."),
  email_institucional: z.email("Ingresa un correo válido."),
  anio_ingreso: z.coerce.number().int().optional(),
  ciclo_actual: z.coerce.number().int().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function AlumnoForm({ onCreated }: { onCreated?: () => void }) {
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo_matricula: "",
      dni: "",
      nombre_completo: "",
      email_institucional: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    const result = await crearAlumnoAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Alumno registrado.");
    form.reset();
    onCreated?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código de matrícula" error={form.formState.errors.codigo_matricula?.message}>
          <Input {...form.register("codigo_matricula")} />
        </Field>
        <Field label="DNI" error={form.formState.errors.dni?.message}>
          <Input {...form.register("dni")} maxLength={8} />
        </Field>
      </div>

      <Field label="Nombre completo" error={form.formState.errors.nombre_completo?.message}>
        <Input {...form.register("nombre_completo")} />
      </Field>

      <Field label="Correo institucional" error={form.formState.errors.email_institucional?.message}>
        <Input type="email" {...form.register("email_institucional")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Año de ingreso (opcional)">
          <Input type="number" {...form.register("anio_ingreso")} />
        </Field>
        <Field label="Ciclo actual (opcional)">
          <Input type="number" {...form.register("ciclo_actual")} />
        </Field>
      </div>

      <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Registrar alumno
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import type { RespuestaEnvioRequest, SesionInicioRead } from "@/lib/types";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function buildSchema(sesion: SesionInicioRead) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const pregunta of sesion.preguntas) {
    shape[`q_${pregunta.id_pregunta}`] = z
      .string()
      .trim()
      .min(1, "Esta pregunta es obligatoria.");
  }
  return z.object(shape);
}

interface CuestionarioFormProps {
  sesion: SesionInicioRead;
}

export function CuestionarioForm({ sesion }: CuestionarioFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const schema = buildSchema(sesion);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      sesion.preguntas.map((p) => [`q_${p.id_pregunta}`, ""])
    ) as FormValues,
  });

  const totalPreguntas = sesion.preguntas.length;
  const respondidas = Object.values(form.watch()).filter((v) => String(v).trim().length > 0).length;

  async function onSubmit(values: FormValues) {
    const respuestas: RespuestaEnvioRequest["respuestas"] = sesion.preguntas.map((pregunta) => {
      const raw = values[`q_${pregunta.id_pregunta}` as keyof FormValues] as string;
      if (pregunta.tipo_respuesta === "opcion_unica") {
        return { id_pregunta: pregunta.id_pregunta, id_opcion_seleccionada: Number(raw) };
      }
      return { id_pregunta: pregunta.id_pregunta, valor_texto: raw };
    });

    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/cuestionario/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: sesion.id_sesion, respuestas }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.detail ?? "No se pudo enviar el cuestionario.");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("No se pudo conectar con el servidor. Intenta nuevamente.");
    }
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold">¡Gracias por completar el cuestionario!</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tus respuestas fueron registradas correctamente. El equipo de UNAYOE las revisará y
            se pondrá en contacto contigo si es necesario.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progreso</span>
          <span>
            {respondidas}/{totalPreguntas}
          </span>
        </div>
        <Progress value={(respondidas / Math.max(totalPreguntas, 1)) * 100} />
      </div>

      {sesion.preguntas.map((pregunta, index) => {
        const fieldName = `q_${pregunta.id_pregunta}` as keyof FormValues;
        const error = form.formState.errors[fieldName];

        return (
          <Card key={pregunta.id_pregunta}>
            <CardHeader>
              <CardTitle className="text-base font-medium leading-relaxed">
                {index + 1}. {pregunta.enunciado}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pregunta.tipo_respuesta === "opcion_unica" ? (
                <RadioGroup
                  value={form.watch(fieldName) as string}
                  onValueChange={(value) =>
                    form.setValue(fieldName, value as FormValues[typeof fieldName], {
                      shouldValidate: true,
                    })
                  }
                  className="gap-3"
                >
                  {pregunta.opciones.map((opcion) => (
                    <div key={opcion.id_opcion} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={String(opcion.id_opcion)}
                        id={`opcion-${opcion.id_opcion}`}
                      />
                      <Label htmlFor={`opcion-${opcion.id_opcion}`} className="font-normal">
                        {opcion.texto_opcion}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  {...form.register(fieldName)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={3}
                />
              )}
              {error && (
                <p className="mt-2 text-sm text-destructive">{String(error.message)}</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar respuestas
      </Button>
    </form>
  );
}

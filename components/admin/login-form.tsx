"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/(auth)/login/actions";

const schema = z.object({
  email: z.email("Ingresa un correo válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type FormValues = z.infer<typeof schema>;

// El backend (Render, plan free) puede tardar 30-50s en despertar tras estar
// inactivo. Si el login sigue pendiente pasado este tiempo, mostramos un
// aviso para que no parezca que la app se congeló.
const COLD_START_HINT_DELAY_MS = 4000;

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [showColdStartHint, setShowColdStartHint] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!isSubmitting) {
      // Reinicia el aviso al terminar el submit (éxito, error o redirect) — no hay
      // forma declarativa de "cancelar" un timeout ya disparado desde afuera.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowColdStartHint(false);
      return;
    }
    const timer = setTimeout(() => setShowColdStartHint(true), COLD_START_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  async function onSubmit(values: FormValues) {
    const result = await loginAction(values, next);
    if (result?.error) {
      form.setError("root", { message: result.error });
      return;
    }
    if (result?.redirectTo) {
      // replace (no push) para que /login no quede en el historial tras un login exitoso.
      router.replace(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo institucional</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      {form.formState.errors.root && (
        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
      )}

      <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Iniciar sesión
      </Button>

      {showColdStartHint && (
        <p className="text-center text-sm text-muted-foreground">
          Esto puede tardar hasta un minuto si el servidor estaba inactivo. Por favor espera...
        </p>
      )}
    </form>
  );
}

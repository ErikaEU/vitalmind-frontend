import { HeartPulse } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1">
      {/* Panel de marca — oscuro, fijo (no depende del theme toggle). Oculto en mobile. */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-success/20 blur-3xl"
        />

        <div className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">VitalMind</span>
        </div>

        <div className="relative max-w-sm space-y-3">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Bienestar universitario, acompañado con cuidado.
          </h1>
          <p className="text-sm leading-relaxed text-sidebar-foreground/70">
            Ecosistema integral de monitoreo y gestión del bienestar psicológico — Facultad de
            Ingeniería de Sistemas e Informática, UNMSM.
          </p>
        </div>

        <p className="relative text-xs text-sidebar-foreground/50">
          Unidad de Apoyo y Orientación al Estudiante — UNAYOE
        </p>
      </div>

      {/* Panel de formulario — claro. */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-4 py-16">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-xl font-semibold tracking-tight">Bienvenida de vuelta</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa con tu cuenta institucional para continuar.
            </p>
          </div>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}

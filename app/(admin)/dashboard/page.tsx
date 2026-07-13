import Link from "next/link";
import { ClipboardList, Users, CalendarClock, CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/auth";
import { listTamizajes } from "@/lib/api-server";
import type { EstadoTamizaje } from "@/lib/types";

const QUICK_ACTIONS = [
  {
    href: "/tamizajes",
    title: "Nuevo tamizaje",
    description: "Crea un tamizaje y genera tokens de acceso para los alumnos.",
    icon: ClipboardList,
  },
  {
    href: "/alumnos",
    title: "Padrón de alumnos",
    description: "Busca, registra o actualiza alumnos del programa.",
    icon: Users,
  },
  {
    href: "/citas",
    title: "Agenda de citas",
    description: "Revisa y gestiona las citas programadas.",
    icon: CalendarClock,
  },
  {
    href: "/disponibilidad",
    title: "Disponibilidad",
    description: "Configura los horarios disponibles para citas.",
    icon: CalendarDays,
  },
];

const ESTADO_VARIANT: Record<EstadoTamizaje, "default" | "secondary" | "destructive" | "outline"> = {
  borrador: "outline",
  activo: "default",
  cerrado: "secondary",
  anulado: "destructive",
};

export default async function DashboardPage() {
  const [session, tamizajes] = await Promise.all([requireSession(), listTamizajes()]);
  const recientes = tamizajes.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {session.nombre_completo.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panel de bienestar universitario — VitalMind FISI UNMSM
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.href}>
              <CardHeader className="pb-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" size="sm">
                  <Link href={action.href}>Ir</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tamizajes recientes</CardTitle>
          <CardDescription>Los últimos {recientes.length} tamizajes creados.</CardDescription>
        </CardHeader>
        <CardContent>
          {recientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay tamizajes. Crea el primero para empezar.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {recientes.map((t) => (
                <li key={t.id_tamizaje} className="py-2">
                  <Link
                    href={`/tamizajes/${t.id_tamizaje}`}
                    className="flex items-center justify-between gap-2 text-sm hover:underline"
                  >
                    <span className="font-medium">{t.nombre}</span>
                    <Badge variant={ESTADO_VARIANT[t.estado]} className="capitalize">
                      {t.estado}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

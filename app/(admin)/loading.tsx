import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Cubre TODAS las páginas bajo app/(admin)/ (dashboard, tamizajes, resultados,
 * citas, disponibilidad, alumnos y sus rutas dinámicas) mientras su fetch
 * server-side está pendiente. Es la defensa principal contra la sensación de
 * "app congelada" durante un cold start del backend en Render (30-60s).
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          Cargando... si el backend estaba inactivo esto puede tardar hasta un minuto.
        </span>
      </div>

      <Skeleton className="h-7 w-48" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

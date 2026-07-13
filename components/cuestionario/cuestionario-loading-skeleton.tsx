import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * El backend (Render, plan free) puede tardar 30-50s en responder tras estar
 * inactivo. Este fallback de Suspense se muestra de inmediato mientras
 * CuestionarioContent espera la respuesta, para que la página nunca se vea
 * congelada durante un cold start.
 */
export function CuestionarioLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Cargando tu cuestionario...</p>
          <p className="mt-1 text-xs text-muted-foreground">
            La primera carga puede tardar hasta un minuto. Por favor espera, no cierres ni
            recargues esta página.
          </p>
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

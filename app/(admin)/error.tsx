"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div className="max-w-md">
        <h1 className="text-lg font-semibold">No se pudo cargar esta página</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message ||
            "Ocurrió un error al conectar con el backend. Si estaba inactivo (plan gratuito de Render), puede tardar hasta un minuto en responder."}
        </p>
      </div>
      <Button onClick={() => reset()}>Reintentar</Button>
    </div>
  );
}

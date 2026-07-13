"use client";

import { useTransition } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { activarTamizajeAction } from "@/app/(admin)/tamizajes/actions";

export function ActivarTamizajeButton({ idTamizaje }: { idTamizaje: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await activarTamizajeAction(idTamizaje);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tamizaje activado.");
    });
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
      Activar tamizaje
    </Button>
  );
}

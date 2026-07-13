"use client";

import { useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { regenerarTokenAction } from "@/app/(admin)/tamizajes/actions";

export function RegenerarTokenButton({
  idTamizaje,
  idAlumno,
}: {
  idTamizaje: number;
  idAlumno: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await regenerarTokenAction(idTamizaje, idAlumno);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Token regenerado y reenviado al alumno.");
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Regenerar token
    </Button>
  );
}

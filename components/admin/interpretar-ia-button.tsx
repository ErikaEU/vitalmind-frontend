"use client";

import { useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { interpretarIAAction } from "@/app/(admin)/resultados/actions";

export function InterpretarIAButton({ idResultado }: { idResultado: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await interpretarIAAction(idResultado);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Interpretación IA generada.");
    });
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Generar interpretación IA
    </Button>
  );
}

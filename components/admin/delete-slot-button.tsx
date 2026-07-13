"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { eliminarSlotAction } from "@/app/(admin)/disponibilidad/actions";

export function DeleteSlotButton({ idSlot }: { idSlot: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await eliminarSlotAction(idSlot);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Slot eliminado.");
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

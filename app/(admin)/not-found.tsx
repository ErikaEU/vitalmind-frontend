import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <FileQuestion className="h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-lg font-semibold">No se encontró el recurso</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          El tamizaje, resultado o registro que buscas no existe o fue eliminado.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}

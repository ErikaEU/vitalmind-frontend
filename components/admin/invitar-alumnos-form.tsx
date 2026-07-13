"use client";

import { useMemo, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { fetchAlumnos } from "@/lib/api-client";
import { invitarAlumnosAction } from "@/app/(admin)/tamizajes/actions";
import type { AlumnoRead } from "@/lib/types";

export function InvitarAlumnosForm({ idTamizaje }: { idTamizaje: number }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Map<number, AlumnoRead>>(new Map());
  const [isPending, startTransition] = useTransition();

  const { data: resultados, isFetching } = useQuery({
    queryKey: ["alumnos-search", search],
    queryFn: () => fetchAlumnos(search),
    enabled: search.trim().length >= 2,
  });

  const selectedList = useMemo(() => Array.from(selected.values()), [selected]);

  function toggle(alumno: AlumnoRead) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(alumno.id_alumno)) {
        next.delete(alumno.id_alumno);
      } else {
        next.set(alumno.id_alumno, alumno);
      }
      return next;
    });
  }

  function handleInvitar() {
    if (selectedList.length === 0) return;
    startTransition(async () => {
      const result = await invitarAlumnosAction(
        idTamizaje,
        selectedList.map((a) => a.id_alumno)
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const fallidos = result.fallidos ?? [];
      toast.success(`Enviados: ${result.enviados ?? 0}.${fallidos.length ? ` Fallidos: ${fallidos.length}.` : ""}`);
      if (fallidos.length > 0) {
        fallidos.forEach((f) => toast.error(`Alumno #${f.id_alumno}: ${f.motivo}`));
      }
      setSelected(new Map());
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar alumno por nombre..."
          className="pl-8"
        />
      </div>

      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedList.map((alumno) => (
            <Badge key={alumno.id_alumno} variant="secondary" className="gap-1">
              {alumno.nombre_completo}
              <button type="button" onClick={() => toggle(alumno)} aria-label="Quitar">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {search.trim().length >= 2 && (
        <div className="max-h-56 overflow-y-auto rounded-md border">
          {isFetching && (
            <p className="p-3 text-sm text-muted-foreground">Buscando...</p>
          )}
          {!isFetching && resultados?.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">Sin resultados.</p>
          )}
          {resultados?.map((alumno) => (
            <label
              key={alumno.id_alumno}
              className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50"
            >
              <Checkbox
                checked={selected.has(alumno.id_alumno)}
                onCheckedChange={() => toggle(alumno)}
              />
              <span className="flex-1">{alumno.nombre_completo}</span>
              <span className="text-xs text-muted-foreground">{alumno.codigo_matricula}</span>
            </label>
          ))}
        </div>
      )}

      <Button
        type="button"
        onClick={handleInvitar}
        disabled={selectedList.length === 0 || isPending}
        className="w-fit"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Invitar {selectedList.length > 0 ? `(${selectedList.length})` : ""}
      </Button>
    </div>
  );
}

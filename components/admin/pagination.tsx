import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Paginación server-driven (Server Component) — genera un href por página. */
  hrefForPage?: (page: number) => string;
  /** Paginación client-driven (Client Component) — cambia de página localmente. */
  onPageChange?: (page: number) => void;
}

/**
 * El backend no soporta offset/limit todavía (devuelve la lista completa),
 * así que esta paginación es del lado del cliente/servidor Next.js sobre el
 * arreglo ya cargado — no reduce la carga al backend, solo la cantidad de
 * filas renderizadas a la vez.
 */
export function Pagination({ page, totalPages, hrefForPage, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {hrefForPage ? (
          <>
            <Button asChild variant="outline" size="sm" disabled={prevDisabled}>
              <Link
                href={hrefForPage(page - 1)}
                aria-disabled={prevDisabled}
                tabIndex={prevDisabled ? -1 : undefined}
                className={prevDisabled ? "pointer-events-none opacity-50" : undefined}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={nextDisabled}>
              <Link
                href={hrefForPage(page + 1)}
                aria-disabled={nextDisabled}
                tabIndex={nextDisabled ? -1 : undefined}
                className={nextDisabled ? "pointer-events-none opacity-50" : undefined}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={prevDisabled}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={nextDisabled}
              onClick={() => onPageChange?.(page + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

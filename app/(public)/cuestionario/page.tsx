import { Suspense } from "react";
import { CuestionarioContent } from "@/components/cuestionario/cuestionario-content";
import { CuestionarioLoadingSkeleton } from "@/components/cuestionario/cuestionario-loading-skeleton";
import { ErrorScreen } from "@/components/cuestionario/error-screen";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function CuestionarioPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      {!token ? (
        <ErrorScreen message="Este enlace no incluye un token de acceso válido. Verifica el enlace que recibiste por correo." />
      ) : (
        <Suspense fallback={<CuestionarioLoadingSkeleton />}>
          <CuestionarioContent token={token} />
        </Suspense>
      )}
    </div>
  );
}

import { CitasManager } from "@/components/admin/citas-manager";

interface PageProps {
  searchParams: Promise<{ id_alumno?: string; id_resultado?: string }>;
}

export default async function CitasPage({ searchParams }: PageProps) {
  const { id_alumno, id_resultado } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Citas</h1>
        <p className="text-sm text-muted-foreground">
          Agenda citas sobre slots disponibles y da seguimiento a su estado.
        </p>
      </div>

      <CitasManager
        prefillIdAlumno={id_alumno ? Number(id_alumno) : undefined}
        prefillIdResultado={id_resultado ? Number(id_resultado) : undefined}
      />
    </div>
  );
}

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DisponibilidadForm } from "@/components/admin/disponibilidad-form";
import { DeleteSlotButton } from "@/components/admin/delete-slot-button";
import { listSlots } from "@/lib/api-server";

export default async function DisponibilidadPage() {
  const slots = await listSlots({ solo_disponibles: false });
  const sorted = [...slots].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Disponibilidad</h1>
        <p className="text-sm text-muted-foreground">
          Configura los horarios disponibles para agendar citas (08:00–17:00).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo slot</CardTitle>
        </CardHeader>
        <CardContent>
          <DisponibilidadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slots configurados</CardTitle>
          <CardDescription>{sorted.length} en total</CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay slots configurados todavía.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((slot) => (
                  <TableRow key={slot.id_slot}>
                    <TableCell>
                      {format(new Date(`${slot.fecha}T00:00:00`), "PPP", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {slot.hora_inicio.slice(0, 5)} – {slot.hora_fin.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={slot.disponible ? "secondary" : "outline"}>
                        {slot.disponible ? "Disponible" : "Ocupado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {slot.disponible && <DeleteSlotButton idSlot={slot.id_slot} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

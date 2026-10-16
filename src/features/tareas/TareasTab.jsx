import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearFecha } from "@/lib/formato";
import { mensajeDeError } from "@/lib/api";
import { actualizarTarea, crearTarea, eliminarTarea, obtenerTareas } from "./tareasService";

const vencida = (tarea) => tarea.estado !== "hecha" && tarea.fecha_prevista &&
  new Date(`${tarea.fecha_prevista.slice(0, 10)}T00:00:00`) < new Date(new Date().toDateString());

export default function TareasTab({ evento }) {
  const idEvento = evento?.id_evento;
  const [tareas, setTareas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    if (!idEvento) return;
    try {
      const { data } = await obtenerTareas({ evento: idEvento });
      setTareas(data);
      setError("");
    } catch (e) {
      setError(mensajeDeError(e, "No se pudieron cargar las tareas del evento"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [idEvento]);

  const handleCrear = async (event) => {
    event.preventDefault();
    if (!descripcion.trim()) return;
    setGuardando(true);
    try {
      await crearTarea({ id_evento: idEvento, descripcion: descripcion.trim(), fecha_prevista: fecha || null });
      setDescripcion("");
      setFecha("");
      await cargar();
      toast.success("Se creó la tarea");
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo crear la tarea"));
    } finally {
      setGuardando(false);
    }
  };

  const marcarHecha = async (tarea) => {
    try {
      await actualizarTarea(tarea.id_tarea, { estado: "hecha" });
      setTareas((actuales) => actuales.map((actual) => actual.id_tarea === tarea.id_tarea ? { ...actual, estado: "hecha" } : actual));
      toast.success("Se marcó la tarea como hecha");
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo actualizar la tarea"));
    }
  };

  const handleEliminar = async (tarea) => {
    try {
      await eliminarTarea(tarea.id_tarea);
      setTareas((actuales) => actuales.filter((actual) => actual.id_tarea !== tarea.id_tarea));
      toast.success("Se eliminó la tarea");
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo eliminar la tarea"));
    }
  };

  if (cargando) return <Cargando />;
  if (error) return <MensajeError>{error}</MensajeError>;

  return (
    <div className="space-y-4">
      {tareas.length === 0 ? <Vacio titulo="Todavía no hay tareas para este evento" /> : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tarea</TableHead><TableHead>Responsable</TableHead><TableHead>Fecha prevista</TableHead>
              <TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
            </TableRow></TableHeader>
            <TableBody>{tareas.map((tarea) => (
              <TableRow key={tarea.id_tarea} className={vencida(tarea) ? "bg-destructive/5" : undefined}>
                <TableCell className="font-medium">{tarea.descripcion}</TableCell>
                <TableCell>{tarea.nombre_responsable || "Sin asignar"}</TableCell>
                <TableCell className={vencida(tarea) ? "font-medium text-destructive" : ""}>
                  {tarea.fecha_prevista ? formatearFecha(tarea.fecha_prevista) : "Sin fecha"}{vencida(tarea) ? " · Vencida" : ""}
                </TableCell>
                <TableCell><EstadoBadge estado={tarea.estado} /></TableCell>
                <TableCell className="space-x-1 text-right">
                  {tarea.estado !== "hecha" && <Button variant="outline" size="sm" onClick={() => marcarHecha(tarea)}>Marcar hecha</Button>}
                  <ConfirmDialog titulo="¿Eliminar esta tarea?" descripcion="Esta acción no se puede deshacer."
                    textoConfirmar="Eliminar" onConfirmar={() => handleEliminar(tarea)}>
                    <Button variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                  </ConfirmDialog>
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent></Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCrear} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
            <div className="space-y-2"><Label htmlFor="nueva-tarea">Nueva tarea</Label>
              <Input id="nueva-tarea" value={descripcion} onChange={(event) => setDescripcion(event.target.value)}
                maxLength={200} required placeholder="Descripción de la tarea" /></div>
            <div className="space-y-2"><Label htmlFor="fecha-tarea">Fecha prevista</Label>
              <Input id="fecha-tarea" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} /></div>
            <Button type="submit" disabled={guardando}><span aria-hidden="true">+</span> Agregar tarea</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

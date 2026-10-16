import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearFecha } from "@/lib/formato";
import { mensajeDeError } from "@/lib/api";
import { actualizarTarea, eliminarTarea, obtenerTareas } from "./tareasService";

const ETIQUETAS = {
  todas: "Todos los estados",
  pendiente: "Pendiente",
  en_curso: "En curso",
  hecha: "Hecha"
};

const vencida = (tarea) => tarea.estado !== "hecha" && tarea.fecha_prevista &&
  new Date(`${tarea.fecha_prevista.slice(0, 10)}T00:00:00`) < new Date(new Date().toDateString());

export default function TareasPage() {
  const [tareas, setTareas] = useState([]);
  const [estado, setEstado] = useState("todas");
  const [responsable, setResponsable] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = () => {
    setCargando(true);
    obtenerTareas()
      .then(({ data }) => setTareas(data))
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar las tareas")))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const responsables = useMemo(() => [...new Set(tareas.map((tarea) => tarea.nombre_responsable).filter(Boolean))].sort(), [tareas]);
  const filtradas = tareas.filter((tarea) =>
    (estado === "todas" || tarea.estado === estado) &&
    (responsable === "todos" || tarea.nombre_responsable === responsable)
  );

  const cambiarEstado = async (tarea, nuevoEstado) => {
    try {
      await actualizarTarea(tarea.id_tarea, { estado: nuevoEstado });
      setTareas((actuales) => actuales.map((item) => item.id_tarea === tarea.id_tarea ? { ...item, estado: nuevoEstado } : item));
      toast.success("Se actualizó el estado de la tarea");
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo actualizar la tarea"));
    }
  };

  const handleEliminar = async (tarea) => {
    try {
      await eliminarTarea(tarea.id_tarea);
      setTareas((actuales) => actuales.filter((item) => item.id_tarea !== tarea.id_tarea));
      toast.success("Se eliminó la tarea");
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo eliminar la tarea"));
    }
  };

  return (
    <>
      <PageHeader titulo="Tareas" descripcion="Seguimiento de la preparación de los eventos." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger aria-label="Filtrar tareas por estado"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(ETIQUETAS).map(([value, label]) =>
            <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={responsable} onValueChange={setResponsable}>
          <SelectTrigger aria-label="Filtrar tareas por responsable"><SelectValue placeholder="Todos los responsables" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los responsables</SelectItem>
            {responsables.map((nombre) => <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : filtradas.length === 0 ? (
        <Vacio titulo="No hay tareas para mostrar">Las tareas pendientes de los eventos aparecerán acá.</Vacio>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tarea</TableHead><TableHead>Evento</TableHead><TableHead>Responsable</TableHead>
              <TableHead>Fecha prevista</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtradas.map((tarea) => (
                <TableRow key={tarea.id_tarea} className={vencida(tarea) ? "bg-destructive/5" : undefined}>
                  <TableCell className="font-medium">{tarea.descripcion}</TableCell>
                  <TableCell><Link className="text-primary underline-offset-4 hover:underline" to={`/eventos/${tarea.id_evento}`}>
                    {tarea.nombre_evento}
                  </Link></TableCell>
                  <TableCell>{tarea.nombre_responsable || "Sin asignar"}</TableCell>
                  <TableCell className={vencida(tarea) ? "font-medium text-destructive" : ""}>
                    {tarea.fecha_prevista ? formatearFecha(tarea.fecha_prevista)}{vencida(tarea) ? " · Vencida" : ""}
                  </TableCell>
                  <TableCell><EstadoBadge estado={tarea.estado} /></TableCell>
                  <TableCell className="space-x-1 text-right">
                    {tarea.estado !== "hecha" && <Button variant="outline" size="sm" onClick={() => cambiarEstado(tarea, "hecha")}>Marcar hecha</Button>}
                    <ConfirmDialog titulo="¿Eliminar esta tarea?" descripcion="Esta acción no se puede deshacer."
                      textoConfirmar="Eliminar" onConfirmar={() => handleEliminar(tarea)}>
                      <Button variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                    </ConfirmDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </>
  );
}

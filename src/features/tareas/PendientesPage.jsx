import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ClipboardCheck, PackageCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import PageHeader from "@/components/common/PageHeader";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { mensajeDeError } from "@/lib/api";
import { obtenerPendientes } from "./tareasService";

const TarjetaPendientes = ({ titulo, icono: Icono, cantidad, children }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-base">{titulo} <span className="text-muted-foreground">({cantidad})</span></CardTitle>
      <Icono className="size-5 text-muted-foreground" aria-hidden="true" />
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const EnlaceEvento = ({ id, nombre }) => (
  <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/eventos/${id}`}>{nombre}</Link>
);

const fechaYaPaso = (fecha) =>
  fecha && new Date(`${fecha.slice(0, 10)}T00:00:00`) < new Date(new Date().toDateString());

export default function PendientesPage() {
  const [pendientes, setPendientes] = useState({ servicios: [], tareas: [], propuestas: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerPendientes()
      .then(({ data }) => setPendientes(data))
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los pendientes")))
      .finally(() => setCargando(false));
  }, []);

  const cantidad = pendientes.servicios.length + pendientes.tareas.length + pendientes.propuestas.length;

  return (
    <>
      <PageHeader titulo="Pendientes" descripcion="Lo que necesita seguimiento en los próximos días." />
      {cargando ? <Cargando filas={5} /> : error ? <MensajeError>{error}</MensajeError> : cantidad === 0 ? (
        <Vacio titulo="No hay pendientes por ahora">Los servicios, tareas y propuestas que requieran seguimiento aparecerán acá.</Vacio>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <TarjetaPendientes titulo="Servicios por confirmar" icono={PackageCheck} cantidad={pendientes.servicios.length}>
            {pendientes.servicios.length === 0 ? <p className="text-sm text-muted-foreground">Sin servicios pendientes.</p> :
              <ul className="space-y-3">{pendientes.servicios.map((item) => (
                <li key={item.id_evento_servicio} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                  <p>{item.nombre_servicio}{item.es_propio ? " · Equipo propio" : ""}</p>
                  <p className="text-sm text-muted-foreground"><EnlaceEvento id={item.id_evento} nombre={item.nombre_evento} />
                    {" · "}{formatearFecha(item.fecha_evento)}</p>
                  {item.nombre_proveedor && <p className="text-sm text-muted-foreground">{item.nombre_proveedor}</p>}
                </li>
              ))}</ul>}
          </TarjetaPendientes>

          <TarjetaPendientes titulo="Tareas próximas o vencidas" icono={ClipboardCheck} cantidad={pendientes.tareas.length}>
            {pendientes.tareas.length === 0 ? <p className="text-sm text-muted-foreground">Sin tareas para esta semana.</p> :
              <ul className="space-y-3">{pendientes.tareas.map((item) => {
                const atrasada = fechaYaPaso(item.fecha_prevista);
                return <li key={item.id_tarea} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                  <p className={atrasada ? "font-medium text-destructive" : "font-medium"}>{item.descripcion}</p>
                  <p className="text-sm text-muted-foreground"><EnlaceEvento id={item.id_evento} nombre={item.nombre_evento} />
                    {" · "}{item.fecha_prevista ? formatearFecha(item.fecha_prevista) : "Sin fecha"}
                    {atrasada ? " · Vencida" : ""}</p>
                  {item.nombre_responsable && <p className="text-sm text-muted-foreground">{item.nombre_responsable}</p>}
                  <EstadoBadge estado={item.estado} />
                </li>;
              })}</ul>}
          </TarjetaPendientes>

          <TarjetaPendientes titulo="Propuestas por vencer" icono={CalendarClock} cantidad={pendientes.propuestas.length}>
            {pendientes.propuestas.length === 0 ? <p className="text-sm text-muted-foreground">Sin propuestas próximas a vencer.</p> :
              <ul className="space-y-3">{pendientes.propuestas.map((item) => (
                <li key={item.id_propuesta} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                  <p><EnlaceEvento id={item.id_evento} nombre={item.nombre_evento} /></p>
                  <p className="text-sm text-muted-foreground">{item.nombre_cliente} · Vence {formatearFecha(item.fecha_vencimiento)}</p>
                  <p className="text-sm">Total: {formatearPesos(item.total)}</p>
                  <EstadoBadge estado={item.estado} />
                </li>
              ))}</ul>}
          </TarjetaPendientes>
        </div>
      )}
    </>
  );
}

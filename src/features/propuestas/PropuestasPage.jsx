import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { mensajeDeError } from "@/lib/api";
import { obtenerPropuestas } from "./propuestasService";

const ESTADOS = [
  ["todas", "Todos los estados"],
  ["en_preparacion", "En preparación"],
  ["presentada", "Presentada"],
  ["aceptada", "Aceptada"],
  ["rechazada", "Rechazada"],
  ["vencida", "Vencida"]
];

export default function PropuestasPage() {
  const [propuestas, setPropuestas] = useState([]);
  const [estado, setEstado] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");
    obtenerPropuestas(estado === "todas" ? undefined : { estado })
      .then(({ data }) => setPropuestas(data))
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar las propuestas")))
      .finally(() => setCargando(false));
  }, [estado]);

  return (
    <>
      <PageHeader titulo="Propuestas" descripcion="Presupuestos enviados y su estado de respuesta." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Filtrar por estado</span>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger aria-label="Filtrar propuestas por estado"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ESTADOS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : propuestas.length === 0 ? (
        <Vacio titulo="No hay propuestas para mostrar">Las propuestas de los eventos aparecerán acá.</Vacio>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propuestas.map((propuesta) => (
                  <TableRow key={propuesta.id_propuesta}>
                    <TableCell className="font-medium">
                      <Link className="text-primary underline-offset-4 hover:underline" to={`/eventos/${propuesta.id_evento}`}>
                        {propuesta.nombre_evento}
                      </Link>
                    </TableCell>
                    <TableCell>{propuesta.nombre_cliente}</TableCell>
                    <TableCell><EstadoBadge estado={propuesta.estado} /></TableCell>
                    <TableCell>{propuesta.fecha_presentacion ? formatearFecha(new Date(new Date(propuesta.fecha_presentacion).getTime() + propuesta.vigencia_dias * 86400000)) : "—"}</TableCell>
                    <TableCell className="text-right">{formatearPesos(propuesta.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}

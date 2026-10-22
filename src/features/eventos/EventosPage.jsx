import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { etiquetaEstado, formatearFecha } from "@/lib/formato";
import { ESTADOS_EVENTO, obtenerEventos } from "./eventosService";

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ estado: "todos", desde: "", hasta: "" });

  useEffect(() => {
    let activa = true;
    setCargando(true);
    obtenerEventos({
      estado: filtros.estado === "todos" ? undefined : filtros.estado,
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined,
    })
      .then(({ data }) => {
        if (!activa) return;
        setEventos(data);
        setError("");
      })
      .catch((e) => {
        if (activa) setError(mensajeDeError(e, "No se pudieron cargar los eventos"));
      })
      .finally(() => {
        if (activa) setCargando(false);
      });
    return () => { activa = false; };
  }, [filtros]);

  return (
    <>
      <PageHeader titulo="Solicitudes y eventos" descripcion="Desde que se reciben hasta que se realizan o cancelan.">
        <SoloRol roles={["atencion_cliente"]}>
          <Button asChild><Link to="/eventos/nuevo"><Plus /> Nueva solicitud</Link></Button>
        </SoloRol>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="filtro-estado">Estado</Label>
          <Select value={filtros.estado} onValueChange={(estado) => setFiltros((f) => ({ ...f, estado }))}>
            <SelectTrigger id="filtro-estado" className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADOS_EVENTO.map((estado) => (
                <SelectItem key={estado} value={estado}>{etiquetaEstado(estado)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-desde">Desde</Label>
          <Input id="filtro-desde" type="date" value={filtros.desde}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-hasta">Hasta</Label>
          <Input id="filtro-hasta" type="date" value={filtros.hasta}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))} />
        </div>
      </div>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : eventos.length === 0 ? (
        <Vacio titulo="No hay eventos con esos filtros">
          Probá cambiar el estado o el rango de fechas, o creá la primera solicitud.
        </Vacio>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cantidad estimada</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((evento) => (
                  <TableRow key={evento.id_evento}>
                    <TableCell>
                      <Link to={`/eventos/${evento.id_evento}`} className="font-medium hover:underline">
                        {evento.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>{evento.nombre_cliente}</TableCell>
                    <TableCell>{evento.nombre_tipo_evento}</TableCell>
                    <TableCell>{formatearFecha(evento.fecha)}</TableCell>
                    <TableCell>{evento.cantidad_estimada}</TableCell>
                    <TableCell><EstadoBadge estado={evento.estado} /></TableCell>
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

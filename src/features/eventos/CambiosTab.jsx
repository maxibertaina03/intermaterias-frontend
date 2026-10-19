// Pestaña "Cambios" del detalle del evento · Responsable: Lucas
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha } from "@/lib/formato";
import { obtenerCambiosEvento } from "./eventosService";

export default function CambiosTab({ evento }) {
  const idEvento = evento?.id_evento;
  const [cambios, setCambios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idEvento) return undefined;
    let activa = true;
    obtenerCambiosEvento(idEvento)
      .then(({ data }) => {
        if (!activa) return;
        setCambios(data);
        setError("");
      })
      .catch((e) => {
        if (activa) setError(mensajeDeError(e, "No se pudieron cargar los cambios del evento"));
      })
      .finally(() => {
        if (activa) setCargando(false);
      });
    return () => { activa = false; };
  }, [idEvento]);

  if (cargando) return <Cargando />;
  if (error) return <MensajeError>{error}</MensajeError>;
  if (cambios.length === 0) return <Vacio titulo="Todavía no hay cambios registrados para este evento" />;

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cuándo</TableHead>
              <TableHead>Qué cambió</TableHead>
              <TableHead>Antes</TableHead>
              <TableHead>Después</TableHead>
              <TableHead>Quién</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cambios.map((c) => (
              <TableRow key={c.id_cambio}>
                <TableCell>{formatearFecha(c.fecha)}</TableCell>
                <TableCell className="font-medium">{c.descripcion}</TableCell>
                <TableCell>{c.valor_anterior}</TableCell>
                <TableCell>{c.valor_nuevo}</TableCell>
                <TableCell>{c.nombre_usuario}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

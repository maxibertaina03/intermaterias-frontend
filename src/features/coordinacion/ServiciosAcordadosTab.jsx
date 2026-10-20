import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EstadoBadge from "@/components/common/EstadoBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { useUsuario } from "@/features/auth/UsuarioContext";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha } from "@/lib/formato";
import { obtenerProveedores } from "@/features/catalogos/proveedoresService";
import { actualizarServicioAcordado, confirmarServicioAcordado, obtenerServiciosAcordados } from "./serviciosAcordadosService";

const ROLES = ["responsable_organizacion", "integrante"];
const esCoordinable = (estado) => ["confirmado", "en_preparacion"].includes(estado);

export default function ServiciosAcordadosTab({ evento }) {
  const idEvento = evento?.id_evento;
  const { usuario } = useUsuario();
  const [servicios, setServicios] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [borradores, setBorradores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(null);

  const cargar = async () => {
    if (!idEvento) return;
    try {
      const [{ data }, proveedoresRes] = await Promise.all([obtenerServiciosAcordados(idEvento), obtenerProveedores()]);
      setServicios(data);
      setProveedores(proveedoresRes.data.filter((p) => p.activo));
      setBorradores(Object.fromEntries(data.map((s) => [s.id_evento_servicio, {
        asignacion: s.es_propio ? "propio" : s.id_proveedor ? String(s.id_proveedor) : "sin_asignar",
        id_responsable: s.id_responsable ? String(s.id_responsable) : "sin_asignar",
        observaciones: s.observaciones ?? ""
      }])));
      setError("");
    } catch (e) { setError(mensajeDeError(e, "No se pudieron cargar los servicios acordados")); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [idEvento]);

  const cambiar = (id, campo, valor) => setBorradores((actuales) => ({ ...actuales, [id]: { ...actuales[id], [campo]: valor } }));

  const guardar = async (servicio) => {
    const borrador = borradores[servicio.id_evento_servicio];
    const es_propio = borrador.asignacion === "propio";
    const datos = {
      es_propio,
      id_proveedor: es_propio || borrador.asignacion === "sin_asignar" ? null : Number(borrador.asignacion),
      id_responsable: borrador.id_responsable === "sin_asignar" ? null : Number(borrador.id_responsable),
      observaciones: borrador.observaciones.trim() || null
    };
    setOcupado(servicio.id_evento_servicio);
    try {
      await actualizarServicioAcordado(servicio.id_evento_servicio, datos);
      toast.success("Se guardó la coordinación");
      await cargar();
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo guardar la coordinación")); }
    finally { setOcupado(null); }
  };

  const confirmar = async (servicio) => {
    setOcupado(servicio.id_evento_servicio);
    try {
      await confirmarServicioAcordado(servicio.id_evento_servicio);
      toast.success("Servicio confirmado");
      await cargar();
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo confirmar el servicio")); }
    finally { setOcupado(null); }
  };

  if (cargando) return <Cargando />;
  if (error) return <MensajeError>{error}</MensajeError>;
  if (!servicios.length) return <Vacio titulo="Este evento todavía no tiene servicios acordados">Al aceptar su propuesta se generan los servicios para coordinar.</Vacio>;

  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Asigná un proveedor que ofrezca el servicio o indicá que lo realiza el equipo. La confirmación requiere un evento confirmado o en preparación.</p>
    <Card><CardContent className="overflow-x-auto p-0"><Table>
      <TableHeader><TableRow><TableHead>Servicio</TableHead><TableHead>Proveedor / modalidad</TableHead><TableHead>Responsable</TableHead><TableHead>Observaciones</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
      <TableBody>{servicios.map((servicio) => {
        const borrador = borradores[servicio.id_evento_servicio] ?? { asignacion: "sin_asignar", id_responsable: "sin_asignar", observaciones: "" };
        const elegibles = proveedores.filter((p) => (p.id_servicios ?? []).some((id) => Number(id) === Number(servicio.id_servicio)));
        const coordinable = esCoordinable(servicio.estado_evento);
        const editando = ocupado === servicio.id_evento_servicio;
        return <TableRow key={servicio.id_evento_servicio}>
          <TableCell className="min-w-44"><p className="font-medium">{servicio.nombre_servicio}</p><p className="text-muted-foreground text-xs">{servicio.nombre_evento}{servicio.fecha_evento ? ` · ${formatearFecha(servicio.fecha_evento)}` : ""}</p></TableCell>
          <TableCell className="min-w-56"><Select value={borrador.asignacion} onValueChange={(v) => cambiar(servicio.id_evento_servicio, "asignacion", v)} disabled={!coordinable || editando}>
            <SelectTrigger aria-label={`Proveedor para ${servicio.nombre_servicio}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sin_asignar">Sin asignar</SelectItem><SelectItem value="propio">Lo hace el equipo</SelectItem>{elegibles.map((p) => <SelectItem key={p.id_proveedor} value={String(p.id_proveedor)}>{p.nombre}</SelectItem>)}</SelectContent>
          </Select>{borrador.asignacion !== "propio" && elegibles.length === 0 && <p className="mt-1 text-xs text-muted-foreground">No hay proveedores activos para este servicio.</p>}</TableCell>
          <TableCell className="min-w-44"><Select value={borrador.id_responsable} onValueChange={(v) => cambiar(servicio.id_evento_servicio, "id_responsable", v)} disabled={!coordinable || editando}>
            <SelectTrigger aria-label={`Responsable para ${servicio.nombre_servicio}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sin_asignar">Sin asignar</SelectItem>{usuario?.id_usuario && <SelectItem value={String(usuario.id_usuario)}>Asignarme ({usuario.nombre})</SelectItem>}</SelectContent>
          </Select>{servicio.nombre_responsable && <p className="mt-1 text-xs text-muted-foreground">Actual: {servicio.nombre_responsable}</p>}</TableCell>
          <TableCell className="min-w-48"><Label className="sr-only" htmlFor={`obs-${servicio.id_evento_servicio}`}>Observaciones</Label><Input id={`obs-${servicio.id_evento_servicio}`} value={borrador.observaciones} maxLength={1000} onChange={(e) => cambiar(servicio.id_evento_servicio, "observaciones", e.target.value)} disabled={!coordinable || editando} placeholder="Notas" /></TableCell>
          <TableCell><EstadoBadge estado={servicio.estado} /></TableCell>
          <TableCell className="space-y-1 text-right whitespace-nowrap"><SoloRol roles={ROLES}>
            {coordinable ? <>
              <Button size="sm" variant="outline" onClick={() => guardar(servicio)} disabled={Boolean(ocupado)}>Guardar</Button>
              {servicio.estado === "pendiente" && <ConfirmDialog titulo={`¿Confirmar ${servicio.nombre_servicio}?`} descripcion={borrador.asignacion === "sin_asignar" ? "Antes asigná un proveedor activo o indicá que lo hace el equipo." : "El servicio quedará marcado como confirmado."} textoConfirmar="Confirmar" onConfirmar={() => confirmar(servicio)}>
                <Button size="sm" disabled={Boolean(ocupado) || borrador.asignacion === "sin_asignar"}>Confirmar</Button>
              </ConfirmDialog>}
            </> : <span className="text-muted-foreground text-xs">Evento {servicio.estado_evento}</span>}
          </SoloRol></TableCell>
        </TableRow>;
      })}</TableBody>
    </Table></CardContent></Card>
  </div>;
}

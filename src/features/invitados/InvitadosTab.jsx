import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import EstadoBadge from "@/components/common/EstadoBadge";
import SoloRol from "@/features/auth/SoloRol";
import { useUsuario } from "@/features/auth/UsuarioContext";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { guardarInvitacionEvento, obtenerComprobanteInvitado, obtenerInvitadosEvento, verificarPagoInvitado } from "./invitadosService";

const ROLES_GESTION = ["atencion_cliente", "responsable_organizacion"];
const TOTALES_VACIOS = { van: 0, no_van: 0, a_cobrar: 0, verificados: 0 };

export default function InvitadosTab({ evento }) {
  const idEvento = evento?.id_evento;
  const { tieneRol } = useUsuario();
  const puedeGestionar = tieneRol(...ROLES_GESTION);
  const [datos, setDatos] = useState({ invitacion: null, invitados: [], totales: TOTALES_VACIOS });
  const [precio, setPrecio] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [activa, setActiva] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [accionInvitado, setAccionInvitado] = useState(null);

  const cargar = async () => {
    if (!idEvento) return;
    try {
      const { data } = await obtenerInvitadosEvento(idEvento);
      const invitacion = data.invitacion ?? null;
      setDatos({ invitacion, invitados: data.invitados ?? [], totales: { ...TOTALES_VACIOS, ...data.totales } });
      setPrecio(invitacion?.precio_por_invitado ?? "");
      setFechaLimite(invitacion?.fecha_limite?.slice(0, 10) ?? "");
      setActiva(invitacion?.activa ?? true);
      setError("");
    } catch (e) {
      if (e.response?.status === 404) {
        setDatos({ invitacion: null, invitados: [], totales: TOTALES_VACIOS });
        setError("");
      } else setError(mensajeDeError(e, "No se pudieron cargar los invitados"));
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [idEvento]);

  const guardar = async (event) => {
    event.preventDefault();
    if (precio === "" || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
      toast.error("Indicá un precio por invitado válido, igual o mayor a cero.");
      return;
    }
    setGuardando(true);
    try {
      await guardarInvitacionEvento(idEvento, {
        precio_por_invitado: Number(precio),
        fecha_limite: fechaLimite || null,
        activa
      });
      toast.success("Se guardó el link de invitación");
      await cargar();
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo generar el link")); }
    finally { setGuardando(false); }
  };

  const copiarLink = async () => {
    const link = `${window.location.origin}/invitacion/${datos.invitacion.token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado");
    } catch { toast.error("No se pudo copiar el link. Copialo desde la barra del navegador."); }
  };

  const abrirComprobante = async (invitado) => {
    const ventana = window.open("about:blank", "_blank");
    if (!ventana) return toast.error("Permití ventanas emergentes para ver el comprobante.");
    setAccionInvitado(invitado.id_invitado);
    try {
      const { data } = await obtenerComprobanteInvitado(invitado.id_invitado);
      const url = URL.createObjectURL(data);
      ventana.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      ventana.close();
      toast.error(mensajeDeError(e, "No se pudo abrir el comprobante"));
    } finally { setAccionInvitado(null); }
  };

  const marcarVerificado = async (invitado) => {
    setAccionInvitado(invitado.id_invitado);
    try {
      await verificarPagoInvitado(invitado.id_invitado);
      toast.success("Pago marcado como verificado");
      await cargar();
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo verificar el pago")); }
    finally { setAccionInvitado(null); }
  };

  if (cargando) return <Cargando />;
  if (error) return <MensajeError>{error}</MensajeError>;

  return <div className="space-y-4">
    <Card>
      <CardHeader><CardTitle className="text-lg">Link de invitación</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={guardar} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div className="space-y-2"><Label htmlFor="precio-invitado">Precio por invitado</Label><Input id="precio-invitado" type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} required disabled={!puedeGestionar} /></div>
          <div className="space-y-2"><Label htmlFor="fecha-limite-invitacion">Fecha límite</Label><Input id="fecha-limite-invitacion" type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} disabled={!puedeGestionar} /></div>
          <label className="flex h-9 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={activa} onChange={(e) => setActiva(e.target.checked)} disabled={!puedeGestionar} /> Activa</label>
          <SoloRol roles={ROLES_GESTION}><Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : datos.invitacion ? "Guardar cambios" : <><Link2 /> Generar link</>}</Button></SoloRol>
        </form>
        {datos.invitacion && <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
          <p className="min-w-0 flex-1 truncate text-sm">{window.location.origin}/invitacion/{datos.invitacion.token}</p>
          <SoloRol roles={ROLES_GESTION}><Button type="button" variant="outline" onClick={copiarLink}><Copy /> Copiar link</Button></SoloRol>
          <EstadoBadge estado={datos.invitacion.activa ? "activa" : "inactiva"} />
        </div>}
      </CardContent>
    </Card>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card><CardContent className="pt-5"><p className="text-muted-foreground text-sm">Van</p><p className="text-2xl font-semibold">{datos.totales.van}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-muted-foreground text-sm">No van</p><p className="text-2xl font-semibold">{datos.totales.no_van}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-muted-foreground text-sm">A cobrar</p><p className="text-2xl font-semibold">{formatearPesos(datos.totales.a_cobrar)}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-muted-foreground text-sm">Pagos verificados</p><p className="text-2xl font-semibold">{datos.totales.verificados}</p></CardContent></Card>
    </div>

    {datos.invitados.length === 0 ? <Vacio titulo="Todavía no hay respuestas">Cuando alguien responda la invitación, va a aparecer en esta lista.</Vacio> :
      <Card><CardContent className="overflow-x-auto p-0"><Table>
        <TableHeader><TableRow><TableHead>Invitado</TableHead><TableHead>Asistencia</TableHead><TableHead>Medio de pago</TableHead><TableHead>Comprobante</TableHead><TableHead>Pago</TableHead><TableHead>Respondió</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
        <TableBody>{datos.invitados.map((invitado) => <TableRow key={invitado.id_invitado}>
          <TableCell className="font-medium">{invitado.nombre} {invitado.apellido}</TableCell>
          <TableCell><Badge variant={invitado.asiste ? "default" : "secondary"}>{invitado.asiste ? "Va" : "No va"}</Badge></TableCell>
          <TableCell>{invitado.medio_pago === "efectivo" ? "Efectivo" : invitado.medio_pago === "transferencia" ? "Transferencia" : "—"}</TableCell>
          <TableCell>{invitado.tiene_comprobante ? <Button variant="link" size="sm" onClick={() => abrirComprobante(invitado)} disabled={accionInvitado === invitado.id_invitado}><FileText /> Ver <ExternalLink /></Button> : "—"}</TableCell>
          <TableCell>{invitado.asiste ? <Badge variant={invitado.pago_verificado ? "default" : "secondary"}>{invitado.pago_verificado ? "Verificado" : "Pendiente"}</Badge> : "—"}</TableCell>
          <TableCell>{formatearFecha(invitado.fecha_respuesta)}</TableCell>
          <TableCell className="text-right"><SoloRol roles={ROLES_GESTION}>{invitado.asiste && !invitado.pago_verificado && <Button size="sm" variant="outline" onClick={() => marcarVerificado(invitado)} disabled={Boolean(accionInvitado)}><Check /> Marcar verificado</Button>}</SoloRol></TableCell>
        </TableRow>)}</TableBody>
      </Table></CardContent></Card>}
    {datos.invitacion?.fecha_limite && <p className="text-muted-foreground text-xs">La invitación vence el {formatearFecha(datos.invitacion.fecha_limite)}.</p>}
  </div>;
}

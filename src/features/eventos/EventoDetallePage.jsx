// Detalle de un evento (Responsable: Lucas). Cada pestaña es de un integrante distinto:
// así cada uno trabaja en su archivo sin pisarse. No mover las pestañas a este archivo.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha } from "@/lib/formato";
import PropuestaTab from "@/features/propuestas/PropuestaTab";
import ServiciosAcordadosTab from "@/features/coordinacion/ServiciosAcordadosTab";
import TareasTab from "@/features/tareas/TareasTab";
import CambiosTab from "@/features/eventos/CambiosTab";
import InvitadosTab from "@/features/invitados/InvitadosTab";
import { cambiarEstadoEvento, cancelarEvento, obtenerEvento } from "./eventosService";

const ORGANIZACION = ["atencion_cliente", "responsable_organizacion"];

function Dato({ label, children }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{children}</p>
    </div>
  );
}

// Cerrar el evento: lo marca "realizado" y guarda observaciones del cierre (opcionales).
function CerrarEventoDialog({ onConfirmar }) {
  const [abierto, setAbierto] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleConfirmar = async () => {
    setGuardando(true);
    try {
      await onConfirmar(observaciones.trim() || null);
      setAbierto(false);
      setObservaciones("");
    } catch {
      // el toast de error ya lo muestra el padre; el diálogo queda abierto para reintentar
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild><Button variant="outline">Cerrar evento</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar evento</DialogTitle>
          <DialogDescription>Se marca como realizado. Podés agregar observaciones del cierre.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="observaciones-cierre">Observaciones de cierre</Label>
          <Textarea id="observaciones-cierre" value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)} placeholder="Cómo salió, qué faltó…" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>Volver</Button>
          <Button onClick={handleConfirmar} disabled={guardando}>
            {guardando ? "Guardando…" : "Confirmar cierre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Cancelar el evento: el motivo es obligatorio (se conserva toda la información).
function CancelarEventoDialog({ onConfirmar }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleConfirmar = async () => {
    if (!motivo.trim()) return setError("El motivo es obligatorio");
    setGuardando(true);
    try {
      await onConfirmar(motivo.trim());
      setAbierto(false);
      setMotivo("");
    } catch {
      // el toast de error ya lo muestra el padre; el diálogo queda abierto para reintentar
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => { setAbierto(v); if (!v) { setMotivo(""); setError(""); } }}>
      <DialogTrigger asChild><Button variant="destructive">Cancelar evento</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar este evento?</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer. Se conserva toda la información.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="motivo-cancelacion">Motivo *</Label>
          <Textarea id="motivo-cancelacion" value={motivo} aria-invalid={Boolean(error)}
            onChange={(e) => { setMotivo(e.target.value); setError(""); }} />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>Volver</Button>
          <Button variant="destructive" onClick={handleConfirmar} disabled={guardando}>
            {guardando ? "Cancelando…" : "Cancelar evento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EventoDetallePage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = () => {
    setCargando(true);
    return obtenerEvento(id)
      .then(({ data }) => { setEvento(data); setError(""); })
      .catch((e) => setError(e.response?.status === 404 ? "Evento no encontrado" : mensajeDeError(e, "No se pudo cargar el evento")))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [id]);

  const handleCambiarEstado = async (estado) => {
    try {
      await cambiarEstadoEvento(id, estado);
      toast.success("Se actualizó el estado del evento");
      cargar();
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo cambiar el estado"));
    }
  };

  const handleCerrar = async (observaciones) => {
    try {
      await cambiarEstadoEvento(id, "realizado", observaciones);
      toast.success("Evento cerrado");
      await cargar();
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo cerrar el evento"));
      throw e;
    }
  };

  const handleCancelar = async (motivo) => {
    try {
      await cancelarEvento(id, motivo);
      toast.success("Evento cancelado");
      await cargar();
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo cancelar el evento"));
      throw e;
    }
  };

  if (cargando) return <Cargando />;
  if (error) return (
    <div className="space-y-4">
      <MensajeError>{error}</MensajeError>
      <Button variant="outline" asChild><Link to="/eventos">Volver al listado</Link></Button>
    </div>
  );

  return (
    <>
      <PageHeader titulo={evento.nombre} descripcion={`Solicitud #${evento.id_evento} · ${evento.nombre_cliente}`}>
        <SoloRol roles={ORGANIZACION}>
          <Button variant="outline" asChild><Link to={`/eventos/${id}/editar`}><Pencil /> Editar</Link></Button>
        </SoloRol>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="grid gap-x-6 gap-y-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Dato label="Estado"><EstadoBadge estado={evento.estado} /></Dato>
          <Dato label="Tipo de evento">{evento.nombre_tipo_evento}</Dato>
          <Dato label="Fecha">{formatearFecha(evento.fecha)}</Dato>
          <Dato label="Hora de inicio">{evento.hora_inicio ? evento.hora_inicio.slice(0, 5) : "Sin definir"}</Dato>
          <Dato label="Sede">{evento.nombre_sede || "Sin definir"}</Dato>
          <Dato label="Cantidad estimada">{evento.cantidad_estimada}</Dato>
          <Dato label="Contacto">{evento.nombre_contacto || "Sin definir"}</Dato>
          <Dato label="Cliente">{evento.nombre_cliente}</Dato>
          {evento.necesidades && (
            <div className="sm:col-span-2 lg:col-span-4"><Dato label="Necesidades">{evento.necesidades}</Dato></div>
          )}
          {evento.estado === "cancelado" && evento.motivo_cancelacion && (
            <div className="sm:col-span-2 lg:col-span-4"><Dato label="Motivo de cancelación">{evento.motivo_cancelacion}</Dato></div>
          )}
          {evento.estado === "realizado" && evento.observaciones_cierre && (
            <div className="sm:col-span-2 lg:col-span-4"><Dato label="Observaciones de cierre">{evento.observaciones_cierre}</Dato></div>
          )}
        </CardContent>
      </Card>

      <SoloRol roles={ORGANIZACION}>
        <div className="mb-6 flex flex-wrap gap-2">
          {evento.estado === "recibida" && (
            <Button variant="outline" onClick={() => handleCambiarEstado("falta_informacion")}>
              Marcar falta de información
            </Button>
          )}
          {evento.estado === "confirmado" && (
            <Button variant="outline" onClick={() => handleCambiarEstado("en_preparacion")}>
              Iniciar preparación
            </Button>
          )}
          {(evento.estado === "confirmado" || evento.estado === "en_preparacion") && (
            <CerrarEventoDialog onConfirmar={handleCerrar} />
          )}
          {evento.estado !== "cancelado" && evento.estado !== "realizado" && (
            <CancelarEventoDialog onConfirmar={handleCancelar} />
          )}
        </div>
      </SoloRol>

      <Tabs defaultValue="propuesta">
        <TabsList>
          <TabsTrigger value="propuesta">Propuesta</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="cambios">Cambios</TabsTrigger>
          <TabsTrigger value="invitados">Invitados</TabsTrigger>
        </TabsList>
        <TabsContent value="propuesta"><PropuestaTab evento={evento} /></TabsContent>
        <TabsContent value="servicios"><ServiciosAcordadosTab evento={evento} /></TabsContent>
        <TabsContent value="tareas"><TareasTab evento={evento} /></TabsContent>
        <TabsContent value="cambios"><CambiosTab evento={evento} /></TabsContent>
        <TabsContent value="invitados"><InvitadosTab evento={evento} /></TabsContent>
      </Tabs>
    </>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthLayout from "@/features/auth/AuthLayout";
import { Cargando } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { obtenerInvitacionPublica, responderInvitacion } from "./invitadosService";

const MAX_COMPROBANTE = 5 * 1024 * 1024;
const TIPOS_COMPROBANTE = ["application/pdf", "image/jpeg", "image/png"];

function mensajeCarga(error) {
  if (error.response?.status === 404) return "Este link de invitación no existe. Revisá que la dirección esté completa.";
  if (error.response?.status === 410) return "Esta invitación ya no está activa o el plazo para responder venció.";
  return mensajeDeError(error, "No se pudo cargar la invitación. Probá de nuevo más tarde.");
}

export default function InvitacionPage() {
  const { token } = useParams();
  const [invitacion, setInvitacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", asiste: "", medio_pago: "", comprobante: null });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigente = true;
    obtenerInvitacionPublica(token)
      .then(({ data }) => { if (vigente) setInvitacion(data); })
      .catch((e) => { if (vigente) setErrorCarga(mensajeCarga(e)); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [token]);

  const cambiarArchivo = (event) => {
    const archivo = event.target.files?.[0] ?? null;
    setForm((actual) => ({ ...actual, comprobante: null }));
    setErrores((actual) => ({ ...actual, comprobante: "" }));
    if (!archivo) {
      return;
    }
    if (!TIPOS_COMPROBANTE.includes(archivo.type)) {
      setErrores((actual) => ({ ...actual, comprobante: "El archivo debe ser PDF, JPG o PNG." }));
      event.target.value = "";
    } else if (archivo.size > MAX_COMPROBANTE) {
      setErrores((actual) => ({ ...actual, comprobante: "El comprobante no puede superar los 5 MB." }));
      event.target.value = "";
    } else {
      setForm((actual) => ({ ...actual, comprobante: archivo }));
      setErrores((actual) => ({ ...actual, comprobante: "" }));
    }
  };

  const enviar = async (event) => {
    event.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "Ingresá tu nombre.";
    if (!form.apellido.trim()) nuevos.apellido = "Ingresá tu apellido.";
    if (!form.asiste) nuevos.asiste = "Indicá si vas a asistir.";
    if (form.asiste === "si" && !form.medio_pago) nuevos.medio_pago = "Elegí cómo vas a pagar.";
    if (form.comprobante && !TIPOS_COMPROBANTE.includes(form.comprobante.type)) nuevos.comprobante = "El archivo debe ser PDF, JPG o PNG.";
    if (form.comprobante?.size > MAX_COMPROBANTE) nuevos.comprobante = "El comprobante no puede superar los 5 MB.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const datos = new FormData();
    datos.append("nombre", form.nombre.trim());
    datos.append("apellido", form.apellido.trim());
    datos.append("asiste", String(form.asiste === "si"));
    if (form.asiste === "si") datos.append("medio_pago", form.medio_pago);
    if (form.asiste === "si" && form.medio_pago === "transferencia" && form.comprobante) {
      datos.append("comprobante", form.comprobante);
    }
    setGuardando(true);
    try {
      await responderInvitacion(token, datos);
      setRespuesta(form.asiste === "si");
    } catch (e) {
      if ([404, 410].includes(e.response?.status)) setErrorCarga(mensajeCarga(e));
      else setErrores((actual) => ({ ...actual, general: mensajeDeError(e, "No se pudo enviar la respuesta.") }));
    } finally { setGuardando(false); }
  };

  if (cargando) return <AuthLayout titulo="Cargando invitación"><Cargando /></AuthLayout>;
  if (errorCarga) return <AuthLayout titulo="No pudimos abrir la invitación" descripcion={errorCarga} />;
  if (respuesta !== null) {
    return <AuthLayout titulo="¡Gracias!" descripcion={respuesta
      ? `Registramos que vas al evento ${invitacion.evento}.`
      : `Registramos que no vas a asistir al evento ${invitacion.evento}.`}>
      <p className="text-muted-foreground text-sm">Tu respuesta fue enviada. Ya podés cerrar esta página.</p>
    </AuthLayout>;
  }

  return <AuthLayout titulo={invitacion.evento} descripcion="Respondé esta invitación para que podamos organizar el evento.">
    <div className="space-y-4">
      <Card><CardContent className="grid gap-3 pt-5 text-sm">
        <p className="flex items-center gap-2"><CalendarDays className="text-muted-foreground size-4" />{formatearFecha(invitacion.fecha)}{invitacion.hora_inicio ? ` · ${invitacion.hora_inicio.slice(0, 5)}` : ""}</p>
        {invitacion.sede && <p className="flex items-center gap-2"><MapPin className="text-muted-foreground size-4" />{invitacion.sede}</p>}
        <p className="font-medium">{formatearPesos(invitacion.precio_por_invitado)} por invitado</p>
        {invitacion.fecha_limite && <p className="text-muted-foreground">Respondé antes del {formatearFecha(invitacion.fecha_limite)}.</p>}
      </CardContent></Card>

      <form onSubmit={enviar} noValidate className="grid gap-4">
        {errores.general && <p role="alert" className="text-destructive text-sm">{errores.general}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="invitado-nombre">Nombre</Label><Input id="invitado-nombre" autoComplete="given-name" value={form.nombre} aria-invalid={Boolean(errores.nombre)} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />{errores.nombre && <p className="text-destructive text-xs">{errores.nombre}</p>}</div>
          <div className="space-y-2"><Label htmlFor="invitado-apellido">Apellido</Label><Input id="invitado-apellido" autoComplete="family-name" value={form.apellido} aria-invalid={Boolean(errores.apellido)} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />{errores.apellido && <p className="text-destructive text-xs">{errores.apellido}</p>}</div>
        </div>
        <div className="space-y-2"><Label>¿Vas a asistir?</Label>
          <Select value={form.asiste} onValueChange={(asiste) => setForm({ ...form, asiste, medio_pago: asiste === "si" ? form.medio_pago : "", comprobante: asiste === "si" ? form.comprobante : null })}>
            <SelectTrigger aria-label="¿Vas a asistir?" aria-invalid={Boolean(errores.asiste)}><SelectValue placeholder="Elegí una opción" /></SelectTrigger>
            <SelectContent><SelectItem value="si">Sí, voy</SelectItem><SelectItem value="no">No voy</SelectItem></SelectContent>
          </Select>{errores.asiste && <p className="text-destructive text-xs">{errores.asiste}</p>}
        </div>
        {form.asiste === "si" && <>
          <div className="space-y-2"><Label>Medio de pago</Label>
            <Select value={form.medio_pago} onValueChange={(medio_pago) => setForm({ ...form, medio_pago, comprobante: medio_pago === "transferencia" ? form.comprobante : null })}>
              <SelectTrigger aria-label="Medio de pago" aria-invalid={Boolean(errores.medio_pago)}><SelectValue placeholder="Elegí cómo vas a pagar" /></SelectTrigger>
              <SelectContent><SelectItem value="efectivo">Efectivo</SelectItem><SelectItem value="transferencia">Transferencia</SelectItem></SelectContent>
            </Select>{errores.medio_pago && <p className="text-destructive text-xs">{errores.medio_pago}</p>}
          </div>
          {form.medio_pago === "transferencia" && <div className="space-y-2">
            <Label htmlFor="comprobante">Comprobante (opcional)</Label>
            <Input id="comprobante" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={cambiarArchivo} aria-invalid={Boolean(errores.comprobante)} />
            <p className="text-muted-foreground text-xs">PDF, JPG o PNG. Máximo 5 MB.</p>
            {errores.comprobante && <p className="text-destructive text-xs">{errores.comprobante}</p>}
          </div>}
        </>}
        <Button type="submit" disabled={guardando}>{guardando ? "Enviando…" : "Enviar respuesta"}</Button>
      </form>
    </div>
  </AuthLayout>;
}

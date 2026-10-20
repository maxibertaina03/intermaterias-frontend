import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/PageHeader";
import Campo from "@/components/common/Campo";
import { Cargando, MensajeError } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { obtenerCliente, obtenerClientes } from "@/features/clientes/clientesService";
import { obtenerSedes } from "@/features/catalogos/sedesService";
import { obtenerTiposEvento } from "@/features/catalogos/tiposEventoService";
import { actualizarEvento, crearEvento, obtenerEvento } from "./eventosService";

const VACIO = {
  id_cliente: "", id_contacto: "", id_tipo_evento: "", id_sede: "",
  nombre: "", fecha: "", hora_inicio: "", cantidad_estimada: "", necesidades: "",
};
const SIN_SELECCION = "__sin_seleccion__";

export default function EventoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [clientes, setClientes] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Catálogos para los selects (cliente, tipo de evento, sede)
  useEffect(() => {
    Promise.all([obtenerClientes(), obtenerTiposEvento(), obtenerSedes()])
      .then(([c, t, s]) => {
        setClientes(c.data);
        setTiposEvento(t.data);
        setSedes(s.data);
      })
      .catch((e) => setErrorCarga(mensajeDeError(e, "No se pudieron cargar los catálogos")));
  }, []);

  // Datos del evento si se está editando
  useEffect(() => {
    if (!id) { setCargando(false); return; }
    obtenerEvento(id)
      .then(({ data }) => setForm({
        id_cliente: String(data.id_cliente),
        id_contacto: data.id_contacto ? String(data.id_contacto) : "",
        id_tipo_evento: String(data.id_tipo_evento),
        id_sede: data.id_sede ? String(data.id_sede) : "",
        nombre: data.nombre ?? "",
        fecha: data.fecha ? data.fecha.slice(0, 10) : "",
        hora_inicio: data.hora_inicio ? data.hora_inicio.slice(0, 5) : "",
        cantidad_estimada: String(data.cantidad_estimada ?? ""),
        necesidades: data.necesidades ?? "",
      }))
      .catch((e) => setErrorCarga(e.response?.status === 404 ? "Evento no encontrado" : mensajeDeError(e, "No se pudo cargar el evento")))
      .finally(() => setCargando(false));
  }, [id]);

  // Contactos del cliente elegido (para el select de contacto)
  useEffect(() => {
    if (!form.id_cliente) { setContactos([]); return; }
    let activa = true;
    obtenerCliente(form.id_cliente)
      .then(({ data }) => { if (activa) setContactos(data.contactos ?? []); })
      .catch(() => { if (activa) setContactos([]); });
    return () => { activa = false; };
  }, [form.id_cliente]);

  const handleChange = (campo) => (valorOEvento) => {
    const valor = valorOEvento?.target ? valorOEvento.target.value : valorOEvento;
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = {};
    if (!form.id_cliente) nuevos.id_cliente = "El cliente es obligatorio";
    if (!form.id_tipo_evento) nuevos.id_tipo_evento = "El tipo de evento es obligatorio";
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (!form.fecha) nuevos.fecha = "La fecha es obligatoria";
    if (!form.cantidad_estimada || Number(form.cantidad_estimada) <= 0) {
      nuevos.cantidad_estimada = "La cantidad estimada debe ser mayor a cero";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const datos = {
      id_cliente: Number(form.id_cliente),
      id_contacto: form.id_contacto ? Number(form.id_contacto) : null,
      id_tipo_evento: Number(form.id_tipo_evento),
      id_sede: form.id_sede ? Number(form.id_sede) : null,
      nombre: form.nombre.trim(),
      fecha: form.fecha,
      hora_inicio: form.hora_inicio || null,
      cantidad_estimada: Number(form.cantidad_estimada),
      necesidades: form.necesidades.trim() || null,
    };

    setGuardando(true);
    try {
      if (id) {
        // El cliente de un evento no se reasigna al editar
        const { id_cliente, ...sinCliente } = datos;
        void id_cliente;
        await actualizarEvento(id, sinCliente);
        toast.success("Cambios guardados");
        navigate(`/eventos/${id}`);
      } else {
        const { data } = await crearEvento(datos);
        toast.success("Solicitud creada");
        navigate(`/eventos/${data.id_evento}`);
      }
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo guardar la solicitud"));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Cargando />;
  if (errorCarga) return (
    <div className="space-y-4">
      <MensajeError>{errorCarga}</MensajeError>
      <Button variant="outline" asChild><Link to="/eventos">Volver al listado</Link></Button>
    </div>
  );

  return (
    <>
      <PageHeader titulo={id ? "Editar solicitud" : "Nueva solicitud"} />
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Campo id="id_cliente" label="Cliente" requerido error={errores.id_cliente}>
              <Select value={form.id_cliente} onValueChange={handleChange("id_cliente")} disabled={Boolean(id)}>
                <SelectTrigger id="id_cliente" className="w-full"><SelectValue placeholder="Elegir cliente…" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </Campo>

            <Campo id="id_contacto" label="Contacto">
              <Select value={form.id_contacto || SIN_SELECCION}
                onValueChange={(v) => handleChange("id_contacto")(v === SIN_SELECCION ? "" : v)}
                disabled={!form.id_cliente}>
                <SelectTrigger id="id_contacto" className="w-full"><SelectValue placeholder="Sin definir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_SELECCION}>Sin definir</SelectItem>
                  {contactos.map((ct) => <SelectItem key={ct.id_contacto} value={String(ct.id_contacto)}>{ct.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </Campo>

            <Campo id="id_tipo_evento" label="Tipo de evento" requerido error={errores.id_tipo_evento}>
              <Select value={form.id_tipo_evento} onValueChange={handleChange("id_tipo_evento")}>
                <SelectTrigger id="id_tipo_evento" className="w-full"><SelectValue placeholder="Elegir tipo…" /></SelectTrigger>
                <SelectContent>
                  {tiposEvento.map((t) => <SelectItem key={t.id_tipo_evento} value={String(t.id_tipo_evento)}>{t.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </Campo>

            <Campo id="id_sede" label="Sede">
              <Select value={form.id_sede || SIN_SELECCION}
                onValueChange={(v) => handleChange("id_sede")(v === SIN_SELECCION ? "" : v)}>
                <SelectTrigger id="id_sede" className="w-full"><SelectValue placeholder="Sin definir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_SELECCION}>Sin definir</SelectItem>
                  {sedes.map((s) => <SelectItem key={s.id_sede} value={String(s.id_sede)}>{s.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </Campo>

            <Campo id="nombre" label="Nombre del evento" requerido error={errores.nombre}>
              <Input id="nombre" value={form.nombre} onChange={handleChange("nombre")}
                placeholder="Ej: Bienvenida 2027" aria-invalid={Boolean(errores.nombre)} />
            </Campo>

            <Campo id="cantidad_estimada" label="Cantidad estimada" requerido error={errores.cantidad_estimada}>
              <Input id="cantidad_estimada" type="number" min="1" value={form.cantidad_estimada}
                onChange={handleChange("cantidad_estimada")} aria-invalid={Boolean(errores.cantidad_estimada)} />
            </Campo>

            <Campo id="fecha" label="Fecha prevista" requerido error={errores.fecha}>
              <Input id="fecha" type="date" value={form.fecha} onChange={handleChange("fecha")}
                aria-invalid={Boolean(errores.fecha)} />
            </Campo>

            <Campo id="hora_inicio" label="Hora de inicio">
              <Input id="hora_inicio" type="time" value={form.hora_inicio} onChange={handleChange("hora_inicio")} />
            </Campo>

            <div className="sm:col-span-2">
              <Campo id="necesidades" label="Necesidades y preferencias">
                <Textarea id="necesidades" value={form.necesidades} onChange={handleChange("necesidades")}
                  placeholder="Música, horarios, pedidos especiales…" />
              </Campo>
            </div>

            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => navigate("/eventos")}>Cancelar</Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : id ? "Guardar cambios" : "Crear solicitud"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

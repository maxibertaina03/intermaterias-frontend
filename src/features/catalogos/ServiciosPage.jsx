import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import Campo from "@/components/common/Campo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { formatearPesos } from "@/lib/formato";
import { actualizarServicio, crearServicio, eliminarServicio, obtenerServicios } from "./serviciosService";

const GESTION = ["atencion_cliente", "responsable_propuesta", "responsable_organizacion"];
const INICIAL = { nombre: "", descripcion: "", precio_referencia: "" };

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogo, setDialogo] = useState(null);
  const [form, setForm] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargar = () => obtenerServicios().then(({ data }) => { setServicios(data); setError(""); })
    .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los servicios")))
    .finally(() => setCargando(false));
  useEffect(() => { cargar(); }, []);

  const abrir = (servicio) => {
    setForm(servicio ? { nombre: servicio.nombre, descripcion: servicio.descripcion ?? "", precio_referencia: servicio.precio_referencia ?? "" } : INICIAL);
    setErrores({});
    setDialogo(servicio ?? {});
  };

  const guardar = async (event) => {
    event.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (form.precio_referencia !== "" && (!Number.isFinite(Number(form.precio_referencia)) || Number(form.precio_referencia) < 0)) nuevos.precio_referencia = "Ingresá un importe igual o mayor a cero";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    const datos = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || null, precio_referencia: form.precio_referencia === "" ? null : Number(form.precio_referencia) };
    setGuardando(true);
    try {
      if (dialogo.id_servicio) await actualizarServicio(dialogo.id_servicio, datos);
      else await crearServicio(datos);
      toast.success(dialogo.id_servicio ? "Servicio actualizado" : "Servicio creado");
      setDialogo(null);
      await cargar();
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo guardar el servicio")); }
    finally { setGuardando(false); }
  };

  const eliminar = async (servicio) => {
    try {
      await eliminarServicio(servicio.id_servicio);
      setServicios((actuales) => actuales.filter((item) => item.id_servicio !== servicio.id_servicio));
      toast.success(`Se eliminó ${servicio.nombre}`);
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo eliminar el servicio")); }
  };

  return <>
    <PageHeader titulo="Servicios" descripcion="Prestaciones que se pueden incluir en propuestas y eventos.">
      <SoloRol roles={GESTION}><Button onClick={() => abrir(null)}><Plus /> Nuevo servicio</Button></SoloRol>
    </PageHeader>
    {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : servicios.length === 0 ? <Vacio titulo="Todavía no hay servicios">Creá servicios para usarlos en propuestas.</Vacio> :
      <Card><CardContent className="overflow-x-auto p-0"><Table>
        <TableHeader><TableRow><TableHead>Servicio</TableHead><TableHead>Descripción</TableHead><TableHead className="text-right">Precio de referencia</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
        <TableBody>{servicios.map((s) => <TableRow key={s.id_servicio}>
          <TableCell className="font-medium">{s.nombre}</TableCell><TableCell>{s.descripcion || <span className="text-muted-foreground">Sin descripción</span>}</TableCell>
          <TableCell className="text-right">{s.precio_referencia == null ? "—" : formatearPesos(s.precio_referencia)}</TableCell><TableCell><EstadoBadge estado={s.activo ? "activo" : "inactivo"} /></TableCell>
          <TableCell className="space-x-1 text-right whitespace-nowrap"><SoloRol roles={GESTION}>
            <Button variant="ghost" size="sm" onClick={() => abrir(s)}><Pencil /> Editar</Button>
            <ConfirmDialog titulo={`¿Eliminar ${s.nombre}?`} descripcion="Si está usado en propuestas, proveedores o eventos, la API impedirá eliminarlo." textoConfirmar="Eliminar" onConfirmar={() => eliminar(s)}>
              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 /> Eliminar</Button>
            </ConfirmDialog>
          </SoloRol></TableCell>
        </TableRow>)}</TableBody>
      </Table></CardContent></Card>}
    <Dialog open={dialogo !== null} onOpenChange={(open) => !open && setDialogo(null)}>
      <DialogContent><DialogHeader><DialogTitle>{dialogo?.id_servicio ? "Editar servicio" : "Nuevo servicio"}</DialogTitle><DialogDescription>El precio es orientativo y puede modificarse en cada propuesta.</DialogDescription></DialogHeader>
        <form id="form-servicio" onSubmit={guardar} noValidate className="grid gap-4">
          <Campo id="servicio-nombre" label="Nombre" requerido error={errores.nombre}><Input id="servicio-nombre" maxLength={100} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} /></Campo>
          <Campo id="servicio-descripcion" label="Descripción"><Input id="servicio-descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Campo>
          <Campo id="servicio-precio" label="Precio de referencia" error={errores.precio_referencia}><Input id="servicio-precio" type="number" min="0" step="0.01" value={form.precio_referencia} onChange={(e) => setForm({ ...form, precio_referencia: e.target.value })} aria-invalid={Boolean(errores.precio_referencia)} /></Campo>
        </form>
        <DialogFooter><Button variant="outline" onClick={() => setDialogo(null)}>Cancelar</Button><Button type="submit" form="form-servicio" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

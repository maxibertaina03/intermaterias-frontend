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
import { obtenerServicios } from "./serviciosService";
import { actualizarProveedor, actualizarServiciosProveedor, crearProveedor, eliminarProveedor, obtenerProveedores } from "./proveedoresService";

const GESTION = ["atencion_cliente", "responsable_propuesta", "responsable_organizacion"];
const INICIAL = { nombre: "", contacto_nombre: "", telefono: "", email: "", observaciones: "" };

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogo, setDialogo] = useState(null);
  const [form, setForm] = useState(INICIAL);
  const [seleccionados, setSeleccionados] = useState([]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargar = () => Promise.all([obtenerProveedores(), obtenerServicios()])
    .then(([proveedoresRes, serviciosRes]) => { setProveedores(proveedoresRes.data); setServicios(serviciosRes.data); setError(""); })
    .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los proveedores y servicios")))
    .finally(() => setCargando(false));
  useEffect(() => { cargar(); }, []);

  const abrir = (proveedor) => {
    setForm(proveedor ? { nombre: proveedor.nombre, contacto_nombre: proveedor.contacto_nombre ?? "", telefono: proveedor.telefono ?? "", email: proveedor.email ?? "", observaciones: proveedor.observaciones ?? "" } : INICIAL);
    setSeleccionados(proveedor?.id_servicios?.map(Number) ?? []);
    setErrores({});
    setDialogo(proveedor ?? {});
  };

  const guardar = async (event) => {
    event.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    const datos = { nombre: form.nombre.trim(), contacto_nombre: form.contacto_nombre.trim() || null, telefono: form.telefono.trim() || null, email: form.email.trim() || null, observaciones: form.observaciones.trim() || null };
    setGuardando(true);
    try {
      let id = dialogo.id_proveedor;
      if (id) await actualizarProveedor(id, datos);
      else ({ data: { id_proveedor: id } } = await crearProveedor(datos));
      await actualizarServiciosProveedor(id, seleccionados);
      toast.success(dialogo.id_proveedor ? "Proveedor actualizado" : "Proveedor creado");
      setDialogo(null);
      await cargar();
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo guardar el proveedor")); }
    finally { setGuardando(false); }
  };

  const eliminar = async (proveedor) => {
    try {
      await eliminarProveedor(proveedor.id_proveedor);
      setProveedores((actuales) => actuales.filter((item) => item.id_proveedor !== proveedor.id_proveedor));
      toast.success(`Se eliminó ${proveedor.nombre}`);
    } catch (e) { toast.error(mensajeDeError(e, "No se pudo eliminar el proveedor")); }
  };

  const alternarServicio = (id) => setSeleccionados((actuales) => actuales.includes(id) ? actuales.filter((item) => item !== id) : [...actuales, id]);

  return <>
    <PageHeader titulo="Proveedores" descripcion="Personas y empresas externas, con los servicios que ofrecen.">
      <SoloRol roles={GESTION}><Button onClick={() => abrir(null)}><Plus /> Nuevo proveedor</Button></SoloRol>
    </PageHeader>
    {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : proveedores.length === 0 ? <Vacio titulo="Todavía no hay proveedores">Registrá proveedores para asignarlos a servicios acordados.</Vacio> :
      <Card><CardContent className="overflow-x-auto p-0"><Table>
        <TableHeader><TableRow><TableHead>Proveedor</TableHead><TableHead>Contacto</TableHead><TableHead>Servicios que ofrece</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
        <TableBody>{proveedores.map((p) => <TableRow key={p.id_proveedor}>
          <TableCell className="font-medium">{p.nombre}{p.email && <p className="text-muted-foreground text-xs">{p.email}</p>}</TableCell>
          <TableCell>{p.contacto_nombre || "Sin contacto"}{p.telefono && <p className="text-muted-foreground text-xs">{p.telefono}</p>}</TableCell>
          <TableCell>{(p.id_servicios ?? []).map((id) => servicios.find((s) => s.id_servicio === id)?.nombre).filter(Boolean).join(", ") || <span className="text-muted-foreground">Sin servicios</span>}</TableCell>
          <TableCell><EstadoBadge estado={p.activo ? "activo" : "inactivo"} /></TableCell>
          <TableCell className="space-x-1 text-right whitespace-nowrap"><SoloRol roles={GESTION}>
            <Button variant="ghost" size="sm" onClick={() => abrir(p)}><Pencil /> Editar</Button>
            <ConfirmDialog titulo={`¿Eliminar ${p.nombre}?`} descripcion="Si está asignado a servicios o eventos, la API impedirá eliminarlo." textoConfirmar="Eliminar" onConfirmar={() => eliminar(p)}>
              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 /> Eliminar</Button>
            </ConfirmDialog>
          </SoloRol></TableCell>
        </TableRow>)}</TableBody>
      </Table></CardContent></Card>}
    <Dialog open={dialogo !== null} onOpenChange={(open) => !open && setDialogo(null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{dialogo?.id_proveedor ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle><DialogDescription>Indicá los datos de contacto y qué servicios ofrece.</DialogDescription></DialogHeader>
        <form id="form-proveedor" onSubmit={guardar} noValidate className="grid gap-4">
          <Campo id="proveedor-nombre" label="Nombre" requerido error={errores.nombre}><Input id="proveedor-nombre" maxLength={150} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} /></Campo>
          <Campo id="proveedor-contacto" label="Persona de contacto"><Input id="proveedor-contacto" maxLength={100} value={form.contacto_nombre} onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })} /></Campo>
          <Campo id="proveedor-telefono" label="Teléfono"><Input id="proveedor-telefono" maxLength={30} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Campo>
          <Campo id="proveedor-email" label="Email"><Input id="proveedor-email" type="email" maxLength={150} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Campo>
          <Campo id="proveedor-observaciones" label="Observaciones"><Input id="proveedor-observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></Campo>
          <fieldset className="space-y-2"><legend className="text-sm font-medium">Servicios que ofrece</legend>
            {servicios.length ? servicios.map((s) => <label key={s.id_servicio} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" checked={seleccionados.includes(s.id_servicio)} onChange={() => alternarServicio(s.id_servicio)} />{s.nombre}
            </label>) : <p className="text-muted-foreground text-sm">Primero cargá servicios en el catálogo.</p>}
          </fieldset>
        </form>
        <DialogFooter><Button variant="outline" onClick={() => setDialogo(null)}>Cancelar</Button><Button type="submit" form="form-proveedor" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

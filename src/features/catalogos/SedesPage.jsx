import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import Campo from "@/components/common/Campo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { actualizarSede, crearSede, eliminarSede, obtenerSedes } from "./sedesService";

const GESTION = ["atencion_cliente", "responsable_propuesta", "responsable_organizacion"];
const VACIO = { nombre: "", direccion: "", capacidad: "" };

export default function SedesPage() {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null); // null: cerrado · {}: nueva · sede: editar
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    obtenerSedes()
      .then(({ data }) => { setSedes(data); setError(""); })
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar las sedes")))
      .finally(() => setCargando(false));

  useEffect(() => { cargar(); }, []);

  const abrir = (sede) => {
    setErrores({});
    setForm(sede?.id_sede ? { nombre: sede.nombre, direccion: sede.direccion ?? "", capacidad: sede.capacidad ?? "" } : VACIO);
    setEditando(sede ?? {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (form.capacidad !== "" && !(Number.isInteger(Number(form.capacidad)) && Number(form.capacidad) > 0)) {
      nuevos.capacidad = "Tiene que ser un número mayor a cero";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    const datos = { nombre: form.nombre.trim(), direccion: form.direccion.trim() || null, capacidad: form.capacidad === "" ? null : Number(form.capacidad) };
    setGuardando(true);
    try {
      if (editando.id_sede) await actualizarSede(editando.id_sede, datos);
      else await crearSede(datos);
      toast.success(editando.id_sede ? "Sede actualizada" : "Sede creada");
      setEditando(null);
      cargar();
    } catch (err) {
      toast.error(mensajeDeError(err, "No se pudo guardar la sede"));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (sede) => {
    try {
      await eliminarSede(sede.id_sede);
      setSedes((actuales) => actuales.filter((s) => s.id_sede !== sede.id_sede));
      toast.success(`Se eliminó ${sede.nombre}`);
    } catch (err) {
      toast.error(mensajeDeError(err, "No se pudo eliminar la sede"));
    }
  };

  return (
    <>
      <PageHeader titulo="Sedes" descripcion="Salones y lugares donde se hacen los eventos.">
        <SoloRol roles={GESTION}><Button onClick={() => abrir(null)}><Plus /> Nueva sede</Button></SoloRol>
      </PageHeader>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : sedes.length === 0 ? (
        <Vacio titulo="Todavía no hay sedes">Cargá los salones con los que trabajan.</Vacio>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sede</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Capacidad</TableHead>
                  <TableHead className="text-center">Eventos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sedes.map((s) => (
                  <TableRow key={s.id_sede}>
                    <TableCell className="font-medium"><MapPin className="text-muted-foreground mr-1 inline size-4" />{s.nombre}</TableCell>
                    <TableCell>{s.direccion || <span className="text-muted-foreground">Sin dato</span>}</TableCell>
                    <TableCell className="text-right">{s.capacidad ? `${s.capacidad} personas` : "—"}</TableCell>
                    <TableCell className="text-center">{s.cantidad_eventos}</TableCell>
                    <TableCell className="space-x-1 text-right whitespace-nowrap">
                      <SoloRol roles={GESTION}>
                        <Button variant="ghost" size="sm" onClick={() => abrir(s)}><Pencil /> Editar</Button>
                        <ConfirmDialog titulo={`¿Eliminar ${s.nombre}?`} descripcion="Si está usada en algún evento no se puede eliminar."
                          textoConfirmar="Eliminar" onConfirmar={() => handleEliminar(s)}>
                          <Button variant="ghost" size="sm" className="text-destructive"><Trash2 /> Eliminar</Button>
                        </ConfirmDialog>
                      </SoloRol>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={editando !== null} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando?.id_sede ? "Editar sede" : "Nueva sede"}</DialogTitle>
            <DialogDescription>La capacidad ayuda a elegir un salón según la cantidad estimada de asistentes.</DialogDescription>
          </DialogHeader>
          <form id="form-sede" onSubmit={handleSubmit} noValidate className="grid gap-4">
            <Campo id="s-nombre" label="Nombre" requerido error={errores.nombre}>
              <Input id="s-nombre" value={form.nombre} autoFocus onChange={(e) => setForm({ ...form, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} />
            </Campo>
            <Campo id="s-direccion" label="Dirección">
              <Input id="s-direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </Campo>
            <Campo id="s-capacidad" label="Capacidad (personas)" error={errores.capacidad}>
              <Input id="s-capacidad" type="number" min="1" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} aria-invalid={Boolean(errores.capacidad)} />
            </Campo>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="submit" form="form-sede" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

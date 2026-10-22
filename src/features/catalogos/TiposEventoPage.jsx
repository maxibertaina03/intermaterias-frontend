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
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { actualizarTipoEvento, crearTipoEvento, eliminarTipoEvento, obtenerTiposEvento } from "./tiposEventoService";

const GESTION = ["atencion_cliente", "responsable_propuesta", "responsable_organizacion"];

export default function TiposEventoPage() {
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null); // null: cerrado · {}: nuevo · tipo: editar
  const [nombre, setNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    obtenerTiposEvento()
      .then(({ data }) => { setTipos(data); setError(""); })
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los tipos de evento")))
      .finally(() => setCargando(false));

  useEffect(() => { cargar(); }, []);

  const abrir = (tipo) => { setNombre(tipo?.nombre ?? ""); setErrorNombre(""); setEditando(tipo ?? {}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return setErrorNombre("El nombre es obligatorio");
    setGuardando(true);
    try {
      if (editando.id_tipo_evento) await actualizarTipoEvento(editando.id_tipo_evento, nombre.trim());
      else await crearTipoEvento(nombre.trim());
      toast.success(editando.id_tipo_evento ? "Tipo de evento actualizado" : "Tipo de evento creado");
      setEditando(null);
      cargar();
    } catch (err) {
      if (err.response?.status === 409) setErrorNombre(mensajeDeError(err));
      else toast.error(mensajeDeError(err, "No se pudo guardar el tipo de evento"));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (tipo) => {
    try {
      await eliminarTipoEvento(tipo.id_tipo_evento);
      setTipos((actuales) => actuales.filter((t) => t.id_tipo_evento !== tipo.id_tipo_evento));
      toast.success(`Se eliminó ${tipo.nombre}`);
    } catch (err) {
      toast.error(mensajeDeError(err, "No se pudo eliminar el tipo de evento"));
    }
  };

  return (
    <>
      <PageHeader titulo="Tipos de evento" descripcion="Orientan la propuesta, pero no definen los servicios: cada cliente pide lo suyo.">
        <SoloRol roles={GESTION}><Button onClick={() => abrir(null)}><Plus /> Nuevo tipo</Button></SoloRol>
      </PageHeader>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : tipos.length === 0 ? (
        <Vacio titulo="Todavía no hay tipos de evento">Por ejemplo: fiesta de bienvenida, egresados, aniversario.</Vacio>
      ) : (
        <Card className="max-w-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de evento</TableHead>
                  <TableHead className="text-center">Eventos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.map((t) => (
                  <TableRow key={t.id_tipo_evento}>
                    <TableCell className="font-medium">{t.nombre}</TableCell>
                    <TableCell className="text-center">{t.cantidad_eventos}</TableCell>
                    <TableCell className="space-x-1 text-right whitespace-nowrap">
                      <SoloRol roles={GESTION}>
                        <Button variant="ghost" size="sm" onClick={() => abrir(t)}><Pencil /> Editar</Button>
                        <ConfirmDialog titulo={`¿Eliminar "${t.nombre}"?`} descripcion="Si hay eventos de este tipo no se puede eliminar."
                          textoConfirmar="Eliminar" onConfirmar={() => handleEliminar(t)}>
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
            <DialogTitle>{editando?.id_tipo_evento ? "Editar tipo de evento" : "Nuevo tipo de evento"}</DialogTitle>
            <DialogDescription>El nombre no se puede repetir.</DialogDescription>
          </DialogHeader>
          <form id="form-tipo" onSubmit={handleSubmit} noValidate>
            <Campo id="t-nombre" label="Nombre" requerido error={errorNombre}>
              <Input id="t-nombre" value={nombre} autoFocus placeholder="Ej: fiesta de egresados"
                onChange={(e) => { setNombre(e.target.value); setErrorNombre(""); }} aria-invalid={Boolean(errorNombre)} />
            </Campo>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="submit" form="form-tipo" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

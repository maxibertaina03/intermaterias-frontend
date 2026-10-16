import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Campo from "@/components/common/Campo";
import { mensajeDeError } from "@/lib/api";
import { actualizarCliente, crearCliente, TIPOS_CLIENTE } from "./clientesService";

const VACIO = { nombre: "", tipo: "centro_estudiantes", institucion: "" };

// Crear o editar un cliente. Si recibe "cliente", edita; si no, crea.
function FormularioCliente({ onCerrar, cliente, onGuardado }) {
  // El contenido del diálogo se monta al abrirse: el estado arranca con los datos del cliente.
  const [form, setForm] = useState(() =>
    cliente ? { nombre: cliente.nombre, tipo: cliente.tipo, institucion: cliente.institucion ?? "" } : VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrores({ nombre: "El nombre es obligatorio" });
    setGuardando(true);
    try {
      const datos = { nombre: form.nombre.trim(), tipo: form.tipo, institucion: form.institucion.trim() || null };
      const { data } = cliente ? await actualizarCliente(cliente.id_cliente, datos) : await crearCliente(datos);
      toast.success(cliente ? "Cliente actualizado" : "Cliente creado");
      onGuardado(data);
      onCerrar();
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo guardar el cliente"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>Quien encarga los eventos: normalmente, el centro de estudiantes.</DialogDescription>
        </DialogHeader>
        <form id="form-cliente" onSubmit={handleSubmit} noValidate className="grid gap-4">
          <Campo id="nombre" label="Nombre" requerido error={errores.nombre}>
            <Input id="nombre" value={form.nombre} autoFocus placeholder="Centro de Estudiantes …"
              onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setErrores({}); }} aria-invalid={Boolean(errores.nombre)} />
          </Campo>
          <Campo id="tipo" label="Tipo">
            <Select value={form.tipo} onValueChange={(tipo) => setForm({ ...form, tipo })}>
              <SelectTrigger id="tipo" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_CLIENTE).map(([valor, etiqueta]) => <SelectItem key={valor} value={valor}>{etiqueta}</SelectItem>)}
              </SelectContent>
            </Select>
          </Campo>
          <Campo id="institucion" label="Institución">
            <Input id="institucion" value={form.institucion} placeholder="Colegio o escuela"
              onChange={(e) => setForm({ ...form, institucion: e.target.value })} />
          </Campo>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" form="form-cliente" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
        </DialogFooter>
    </>
  );
}

export default function ClienteDialog({ abierto, onCerrar, ...props }) {
  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent>
        {abierto && <FormularioCliente onCerrar={onCerrar} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

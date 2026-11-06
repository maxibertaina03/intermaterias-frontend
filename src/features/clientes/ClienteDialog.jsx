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
const CONTACTO_VACIO = { nombre: "", rol: "", telefono: "", email: "" };

// Crear o editar un cliente. Si recibe "cliente", edita; si no, crea.
function FormularioCliente({ onCerrar, cliente, onGuardado }) {
  // El contenido del diálogo se monta al abrirse: el estado arranca con los datos del cliente.
  const [form, setForm] = useState(() =>
    cliente ? { nombre: cliente.nombre, tipo: cliente.tipo, institucion: cliente.institucion ?? "" } : VACIO);
  // Al crear: la persona de contacto (opcional) queda como contacto vigente
  const [contacto, setContacto] = useState(CONTACTO_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const cambiarContacto = (campo) => (e) => { setContacto({ ...contacto, [campo]: e.target.value }); setErrores({}); };
  const conContacto = Object.values(contacto).some((v) => v.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrores({ nombre: "El nombre es obligatorio" });
    if (!cliente && conContacto && !contacto.nombre.trim()) return setErrores({ contacto_nombre: "Poné el nombre del contacto (o dejá vacíos sus datos)" });
    setGuardando(true);
    try {
      const datos = { nombre: form.nombre.trim(), tipo: form.tipo, institucion: form.institucion.trim() || null };
      if (!cliente && conContacto) {
        datos.contacto = {
          nombre: contacto.nombre.trim(), rol: contacto.rol.trim() || null,
          telefono: contacto.telefono.trim() || null, email: contacto.email.trim() || null,
        };
      }
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
          {!cliente && (
            <fieldset className="grid gap-3 rounded-lg border p-3">
              <legend className="px-1 text-sm font-medium">Persona de contacto <span className="text-muted-foreground font-normal">(opcional)</span></legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo id="contacto_nombre" label="Nombre" error={errores.contacto_nombre}>
                  <Input id="contacto_nombre" value={contacto.nombre} placeholder="Martina Paz" onChange={cambiarContacto("nombre")}
                    aria-invalid={Boolean(errores.contacto_nombre)} />
                </Campo>
                <Campo id="contacto_rol" label="Rol">
                  <Input id="contacto_rol" value={contacto.rol} placeholder="Presidenta del centro" onChange={cambiarContacto("rol")} />
                </Campo>
                <Campo id="contacto_telefono" label="Teléfono">
                  <Input id="contacto_telefono" value={contacto.telefono} type="tel" onChange={cambiarContacto("telefono")} />
                </Campo>
                <Campo id="contacto_email" label="Email">
                  <Input id="contacto_email" value={contacto.email} type="email" onChange={cambiarContacto("email")} />
                </Campo>
              </div>
              <p className="text-muted-foreground text-xs">Queda como contacto vigente. Después podés sumar más desde la ficha del cliente.</p>
            </fieldset>
          )}
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

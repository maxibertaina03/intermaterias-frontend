import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Campo from "@/components/common/Campo";
import { mensajeDeError } from "@/lib/api";
import { actualizarContacto, crearContacto } from "./clientesService";

const VACIO = { nombre: "", rol: "", telefono: "", email: "" };

// Crear o editar una persona de contacto del cliente.
function FormularioContacto({ onCerrar, idCliente, contacto, onGuardado }) {
  // El contenido del diálogo se monta al abrirse: el estado arranca con los datos del contacto.
  const [form, setForm] = useState(() => contacto
    ? { nombre: contacto.nombre, rol: contacto.rol ?? "", telefono: contacto.telefono ?? "", email: contacto.email ?? "" }
    : VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrores({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrores({ nombre: "El nombre es obligatorio" });
    setGuardando(true);
    const datos = {
      nombre: form.nombre.trim(), rol: form.rol.trim() || null,
      telefono: form.telefono.trim() || null, email: form.email.trim() || null,
    };
    try {
      if (contacto) await actualizarContacto(idCliente, contacto.id_contacto, datos);
      else await crearContacto(idCliente, { ...datos, vigente: true });
      toast.success(contacto ? "Contacto actualizado" : "Contacto agregado");
      onGuardado();
      onCerrar();
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo guardar el contacto"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
        <DialogHeader>
          <DialogTitle>{contacto ? "Editar contacto" : "Nuevo contacto"}</DialogTitle>
          <DialogDescription>
            {contacto ? "Datos de la persona que representa al cliente." : "Pasa a ser el contacto vigente: el anterior queda en el historial."}
          </DialogDescription>
        </DialogHeader>
        <form id="form-contacto" onSubmit={handleSubmit} noValidate className="grid gap-4">
          <Campo id="c-nombre" label="Nombre y apellido" requerido error={errores.nombre}>
            <Input id="c-nombre" name="nombre" value={form.nombre} onChange={cambiar} autoFocus aria-invalid={Boolean(errores.nombre)} />
          </Campo>
          <Campo id="c-rol" label="Rol">
            <Input id="c-rol" name="rol" value={form.rol} onChange={cambiar} placeholder="Ej: delegado de 6° A, presidenta de la comisión" />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="c-telefono" label="Teléfono">
              <Input id="c-telefono" name="telefono" type="tel" value={form.telefono} onChange={cambiar} />
            </Campo>
            <Campo id="c-email" label="Email">
              <Input id="c-email" name="email" type="email" value={form.email} onChange={cambiar} />
            </Campo>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" form="form-contacto" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
        </DialogFooter>
    </>
  );
}

export default function ContactoDialog({ abierto, onCerrar, ...props }) {
  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent>
        {abierto && <FormularioContacto onCerrar={onCerrar} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

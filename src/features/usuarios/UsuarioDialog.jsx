import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Campo from "@/components/common/Campo";
import { mensajeDeError } from "@/lib/api";
import { actualizarUsuario, crearUsuario } from "./usuariosService";

const ROLES = [
  ["admin_empresa", "Administrador de la empresa"],
  ["atencion_cliente", "Atención al cliente"],
  ["responsable_propuesta", "Responsable de propuesta"],
  ["responsable_organizacion", "Responsable de organización"],
  ["integrante", "Integrante"],
];

function FormularioUsuario({ usuario, idUsuarioActual, onCerrar, onGuardado }) {
  const [form, setForm] = useState(() => ({
    nombre: usuario?.nombre ?? "", apellido: "", usuario: "", email: usuario?.email ?? "",
    password: "", roles: usuario?.roles ?? ["integrante"], activo: usuario?.activo ?? true,
  }));
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const esEdicion = Boolean(usuario);
  const esUsuarioActual = usuario?.id_usuario === idUsuarioActual;

  const cambiarRol = (rol, marcado) => setForm((actual) => ({
    ...actual,
    roles: marcado ? [...actual.roles, rol] : actual.roles.filter((item) => item !== rol),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (!esEdicion && !/^[a-zA-Z0-9_-]{4,64}$/.test(form.usuario.trim())) {
      nuevos.usuario = "Usá entre 4 y 64 letras, números, guiones o guiones bajos";
    }
    if (!esEdicion && form.password.length < 15) nuevos.password = "La contraseña debe tener al menos 15 caracteres";
    if (!form.roles.length) nuevos.roles = "Elegí al menos un rol";
    if (esUsuarioActual && !form.roles.includes("admin_empresa")) nuevos.roles = "No podés quitarte el rol de administrador";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const datos = esEdicion
      ? { nombre: form.nombre.trim(), email: form.email.trim() || null, roles: form.roles, activo: form.activo }
      : {
          nombre: form.nombre.trim(), apellido: form.apellido.trim() || null,
          usuario: form.usuario.trim().toLowerCase(), email: form.email.trim() || null,
          password: form.password, roles: form.roles,
        };
    setGuardando(true);
    try {
      const { data } = esEdicion
        ? await actualizarUsuario(usuario.id_usuario, datos)
        : await crearUsuario(datos);
      toast.success(esEdicion ? "Usuario actualizado" : "Usuario creado");
      onGuardado(data);
      onCerrar();
    } catch (error) {
      toast.error(mensajeDeError(error, esEdicion ? "No se pudo actualizar el usuario" : "No se pudo crear el usuario"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        <DialogDescription>{esEdicion ? "Actualizá sus datos, roles o acceso a la empresa." : "Creá la cuenta y asignale uno o más roles."}</DialogDescription>
      </DialogHeader>
      <form id="form-usuario" onSubmit={handleSubmit} noValidate className="grid gap-4">
        <Campo id="nombre" label="Nombre" requerido error={errores.nombre}>
          <Input id="nombre" value={form.nombre} autoFocus onChange={(e) => setForm({ ...form, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} />
        </Campo>
        {!esEdicion && <Campo id="apellido" label="Apellido">
          <Input id="apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
        </Campo>}
        {!esEdicion && <Campo id="usuario" label="Usuario" requerido error={errores.usuario}>
          <Input id="usuario" autoComplete="off" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} aria-invalid={Boolean(errores.usuario)} />
        </Campo>}
        <Campo id="email" label="Email">
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Campo>
        {!esEdicion && <Campo id="password" label="Contraseña" requerido error={errores.password}>
          <Input id="password" type="password" autoComplete="new-password" minLength={15} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={Boolean(errores.password)} />
          <p className="text-muted-foreground mt-1 text-xs">Al menos 15 caracteres.</p>
        </Campo>}
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Roles</legend>
          {ROLES.map(([valor, etiqueta]) => (
            <label key={valor} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-primary size-4" checked={form.roles.includes(valor)}
                disabled={esUsuarioActual && valor === "admin_empresa"}
                onChange={(e) => cambiarRol(valor, e.target.checked)} />
              {etiqueta}
            </label>
          ))}
          {errores.roles && <p className="text-destructive text-sm">{errores.roles}</p>}
        </fieldset>
        {esEdicion && <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-primary size-4" checked={form.activo} disabled={esUsuarioActual} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
          Usuario activo{esUsuarioActual && <span className="text-muted-foreground">(no podés desactivarte)</span>}
        </label>}
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
        <Button type="submit" form="form-usuario" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </>
  );
}

export default function UsuarioDialog({ abierto, onCerrar, ...props }) {
  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {abierto && <FormularioUsuario onCerrar={onCerrar} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

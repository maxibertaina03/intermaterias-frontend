// EJEMPLO DE REFERENCIA: listado con shadcn. Copiar este patrón para los demás listados.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Campo from "@/components/common/Campo";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { useUsuario } from "@/features/auth/UsuarioContext";
import { eliminarEmpresa, crearAdministrador, obtenerEmpresas } from "./empresasService";

const FORM_ADMIN_VACIO = { nombre: "", apellido: "", usuario: "", password: "" };

function CrearAdministradorDialog({ empresa, onCerrar }) {
  const [form, setForm] = useState(FORM_ADMIN_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (!/^[a-zA-Z0-9_-]{4,64}$/.test(form.usuario.trim())) nuevos.usuario = "Usá entre 4 y 64 letras, números, guiones o guiones bajos";
    if (form.password.length < 15) nuevos.password = "La contraseña debe tener al menos 15 caracteres";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setGuardando(true);
    try {
      await crearAdministrador(empresa.id_empresa, {
        nombre: form.nombre.trim(), apellido: form.apellido.trim() || null,
        usuario: form.usuario.trim().toLowerCase(), password: form.password,
      });
      toast.success(`Administrador creado para ${empresa.nombre}`);
      onCerrar();
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo crear el administrador"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={Boolean(empresa)} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear administrador</DialogTitle>
          <DialogDescription>Cuenta inicial de {empresa?.nombre}. Tendrá los roles de la empresa.</DialogDescription>
        </DialogHeader>
        <form id="form-admin-empresa" onSubmit={handleSubmit} noValidate className="grid gap-4">
          <Campo id="admin-nombre" label="Nombre" requerido error={errores.nombre}>
            <Input id="admin-nombre" autoFocus value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} />
          </Campo>
          <Campo id="admin-apellido" label="Apellido">
            <Input id="admin-apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          </Campo>
          <Campo id="admin-usuario" label="Usuario" requerido error={errores.usuario}>
            <Input id="admin-usuario" autoComplete="off" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} aria-invalid={Boolean(errores.usuario)} />
          </Campo>
          <Campo id="admin-password" label="Contraseña" requerido error={errores.password}>
            <Input id="admin-password" type="password" autoComplete="new-password" minLength={15} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={Boolean(errores.password)} />
            <p className="text-muted-foreground mt-1 text-xs">Al menos 15 caracteres.</p>
          </Campo>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" form="form-admin-empresa" disabled={guardando}>{guardando ? "Creando…" : "Crear administrador"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EmpresasPage() {
  const { esSuperAdmin } = useUsuario();
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [empresaParaAdmin, setEmpresaParaAdmin] = useState(null);

  useEffect(() => {
    obtenerEmpresas()
      .then(({ data }) => setEmpresas(data))
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar las empresas")))
      .finally(() => setCargando(false));
  }, []);

  const handleEliminar = async (empresa) => {
    try {
      await eliminarEmpresa(empresa.id_empresa);
      setEmpresas((actuales) => actuales.filter((e) => e.id_empresa !== empresa.id_empresa));
      toast.success(`Se eliminó ${empresa.nombre}`);
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo eliminar la empresa"));
    }
  };

  return (
    <>
      <PageHeader titulo="Empresas" descripcion="Empresas organizadoras que usan el sistema.">
        <Button asChild><Link to="/empresas/nueva"><Plus /> Nueva empresa</Link></Button>
      </PageHeader>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : empresas.length === 0 ? (
        <Vacio titulo="Todavía no hay empresas">Creá la primera con “Nueva empresa”.</Vacio>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CUIT</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id_empresa}>
                    <TableCell className="font-medium">{empresa.nombre}</TableCell>
                    <TableCell>{empresa.cuit}</TableCell>
                    <TableCell>{empresa.telefono || "Sin dato"}</TableCell>
                    <TableCell><EstadoBadge estado={empresa.activo ? "activa" : "inactiva"} /></TableCell>
                    <TableCell className="space-x-1 text-right">
                      {esSuperAdmin && <Button variant="outline" size="sm" onClick={() => setEmpresaParaAdmin(empresa)}>Crear administrador</Button>}
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/empresas/${empresa.id_empresa}/editar`}><Pencil /> Editar</Link>
                      </Button>
                      <ConfirmDialog
                        titulo={`¿Eliminar ${empresa.nombre}?`}
                        descripcion="Esta acción no se puede deshacer."
                        textoConfirmar="Eliminar"
                        onConfirmar={() => handleEliminar(empresa)}
                      >
                        <Button variant="ghost" size="sm" className="text-destructive"><Trash2 /> Eliminar</Button>
                      </ConfirmDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {/* key: el formulario arranca vacío cada vez que se abre para una empresa */}
      <CrearAdministradorDialog key={empresaParaAdmin?.id_empresa ?? "cerrado"} empresa={empresaParaAdmin}
        onCerrar={() => setEmpresaParaAdmin(null)} />
    </>
  );
}

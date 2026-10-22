import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { useUsuario } from "@/features/auth/UsuarioContext";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { etiquetaRol } from "@/lib/formato";
import UsuarioDialog from "./UsuarioDialog";
import { obtenerUsuarios } from "./usuariosService";

export default function UsuariosPage() {
  const { usuario, tieneRol } = useUsuario();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogo, setDialogo] = useState(null);
  const puedeAdministrar = tieneRol("admin_empresa");

  const cargarUsuarios = useCallback(() => obtenerUsuarios()
    .then(({ data }) => { setUsuarios(data); setError(""); })
    .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los usuarios")))
    .finally(() => setCargando(false)), []);

  useEffect(() => { if (puedeAdministrar) cargarUsuarios(); }, [cargarUsuarios, puedeAdministrar]);

  const guardarUsuario = (guardado) => {
    setUsuarios((actuales) => {
      const existe = actuales.some((item) => item.id_usuario === guardado.id_usuario);
      return existe
        ? actuales.map((item) => item.id_usuario === guardado.id_usuario ? guardado : item)
        : [...actuales, guardado].sort((a, b) => Number(b.activo) - Number(a.activo) || a.nombre.localeCompare(b.nombre));
    });
  };

  if (!puedeAdministrar) return <MensajeError>Solo el administrador de la empresa puede ver sus usuarios.</MensajeError>;

  return (
    <>
      <PageHeader titulo="Usuarios" descripcion="Administrá las personas, roles y accesos de tu empresa.">
        <SoloRol roles={["admin_empresa"]}><Button onClick={() => setDialogo({ usuario: null })}><Plus /> Nuevo usuario</Button></SoloRol>
      </PageHeader>
      {cargando ? <Cargando filas={5} /> : error ? <MensajeError>{error}</MensajeError> : usuarios.length === 0 ? (
        <Vacio titulo="Todavía no hay usuarios">Creá el primer usuario para sumar a alguien al equipo.</Vacio>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nombre</TableHead><TableHead>Usuario</TableHead><TableHead>Roles</TableHead>
                <TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
              </TableRow></TableHeader>
              <TableBody>{usuarios.map((item) => (
                <TableRow key={item.id_usuario}>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
                  <TableCell>{item.usuario}</TableCell>
                  <TableCell>{item.roles.map(etiquetaRol).join(", ")}</TableCell>
                  <TableCell><EstadoBadge estado={item.activo ? "activa" : "inactiva"} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDialogo({ usuario: item })}><Pencil /> Editar</Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <UsuarioDialog abierto={Boolean(dialogo)} usuario={dialogo?.usuario} idUsuarioActual={usuario?.id_usuario}
        onCerrar={() => setDialogo(null)} onGuardado={guardarUsuario} />
    </>
  );
}

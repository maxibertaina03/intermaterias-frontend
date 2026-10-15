// EJEMPLO DE REFERENCIA: listado con shadcn. Copiar este patrón para los demás listados.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { eliminarEmpresa, obtenerEmpresas } from "./empresasService";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
    </>
  );
}

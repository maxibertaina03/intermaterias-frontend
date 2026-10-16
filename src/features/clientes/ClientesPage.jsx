import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import ClienteDialog from "./ClienteDialog";
import { eliminarCliente, obtenerClientes, TIPOS_CLIENTE } from "./clientesService";

const GESTION = ["atencion_cliente", "responsable_propuesta"];

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [dialogo, setDialogo] = useState({ abierto: false, cliente: null });

  const cargar = () =>
    obtenerClientes()
      .then(({ data }) => { setClientes(data); setError(""); })
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los clientes")))
      .finally(() => setCargando(false));

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (cliente) => {
    try {
      await eliminarCliente(cliente.id_cliente);
      setClientes((actuales) => actuales.filter((c) => c.id_cliente !== cliente.id_cliente));
      toast.success(`Se eliminó ${cliente.nombre}`);
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo eliminar el cliente"));
    }
  };

  const filtrados = clientes.filter((c) => c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

  return (
    <>
      <PageHeader titulo="Clientes" descripcion="Centros de estudiantes que encargan eventos y sus personas de contacto.">
        <SoloRol roles={GESTION}>
          <Button onClick={() => setDialogo({ abierto: true, cliente: null })}><Plus /> Nuevo cliente</Button>
        </SoloRol>
      </PageHeader>

      <div className="relative mb-4 max-w-sm">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
        <Input className="pl-8" placeholder="Buscar cliente…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {cargando ? <Cargando /> : error ? <MensajeError>{error}</MensajeError> : filtrados.length === 0 ? (
        <Vacio titulo={busqueda ? "No hay clientes con ese nombre" : "Todavía no hay clientes"}>
          {!busqueda && "Creá el primero con “Nuevo cliente”."}
        </Vacio>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto vigente</TableHead>
                  <TableHead className="text-center">Eventos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((c) => (
                  <TableRow key={c.id_cliente}>
                    <TableCell>
                      <Link to={`/clientes/${c.id_cliente}`} className="font-medium hover:underline">{c.nombre}</Link>
                      {c.institucion && <p className="text-muted-foreground text-xs">{c.institucion}</p>}
                    </TableCell>
                    <TableCell>{TIPOS_CLIENTE[c.tipo] ?? c.tipo}</TableCell>
                    <TableCell>
                      {c.contacto_nombre ? (
                        <>
                          <p>{c.contacto_nombre}</p>
                          {c.contacto_telefono && <p className="text-muted-foreground text-xs">{c.contacto_telefono}</p>}
                        </>
                      ) : <span className="text-muted-foreground">Sin contacto</span>}
                    </TableCell>
                    <TableCell className="text-center">{c.cantidad_eventos}</TableCell>
                    <TableCell><EstadoBadge estado={c.activo ? "activa" : "inactiva"} /></TableCell>
                    <TableCell className="space-x-1 text-right whitespace-nowrap">
                      <SoloRol roles={GESTION}>
                        <Button variant="ghost" size="sm" onClick={() => setDialogo({ abierto: true, cliente: c })}><Pencil /> Editar</Button>
                        <ConfirmDialog titulo={`¿Eliminar ${c.nombre}?`}
                          descripcion="Se borran también sus contactos. Si tiene eventos no se puede eliminar."
                          textoConfirmar="Eliminar" onConfirmar={() => handleEliminar(c)}>
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

      <ClienteDialog abierto={dialogo.abierto} cliente={dialogo.cliente}
        onCerrar={() => setDialogo({ abierto: false, cliente: null })} onGuardado={cargar} />
    </>
  );
}

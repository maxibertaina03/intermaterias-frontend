import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import SoloRol from "@/features/auth/SoloRol";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha } from "@/lib/formato";
import ClienteDialog from "./ClienteDialog";
import ContactoDialog from "./ContactoDialog";
import { actualizarCliente, actualizarContacto, obtenerCliente, TIPOS_CLIENTE } from "./clientesService";

const GESTION = ["atencion_cliente", "responsable_propuesta"];

export default function ClienteDetallePage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editarCliente, setEditarCliente] = useState(false);
  const [dialogoContacto, setDialogoContacto] = useState({ abierto: false, contacto: null });

  const cargar = useCallback(() =>
    obtenerCliente(id)
      .then(({ data }) => { setCliente(data); setError(""); })
      .catch((e) => setError(e.response?.status === 404 ? "Cliente no encontrado" : mensajeDeError(e, "No se pudo cargar el cliente")))
      .finally(() => setCargando(false)), [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const marcarVigente = async (contacto) => {
    try {
      await actualizarContacto(cliente.id_cliente, contacto.id_contacto, { vigente: true });
      toast.success(`${contacto.nombre} es ahora el contacto vigente`);
      cargar();
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo actualizar el contacto"));
    }
  };

  const cambiarActivo = async () => {
    try {
      await actualizarCliente(cliente.id_cliente, { activo: !cliente.activo });
      toast.success(cliente.activo ? "Cliente desactivado" : "Cliente activado");
      cargar();
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo actualizar el cliente"));
    }
  };

  if (cargando) return <Cargando />;
  if (error) return (
    <div className="space-y-4">
      <MensajeError>{error}</MensajeError>
      <Button variant="outline" asChild><Link to="/clientes">Volver a clientes</Link></Button>
    </div>
  );

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
        <Link to="/clientes"><ArrowLeft /> Clientes</Link>
      </Button>
      <PageHeader titulo={cliente.nombre}
        descripcion={[TIPOS_CLIENTE[cliente.tipo], cliente.institucion].filter(Boolean).join(" · ")}>
        <EstadoBadge estado={cliente.activo ? "activa" : "inactiva"} />
        <SoloRol roles={GESTION}>
          <Button variant="outline" onClick={cambiarActivo}><Power /> {cliente.activo ? "Desactivar" : "Activar"}</Button>
          <Button variant="outline" onClick={() => setEditarCliente(true)}><Pencil /> Editar</Button>
        </SoloRol>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personas de contacto</CardTitle>
            <SoloRol roles={GESTION}>
              <Button size="sm" onClick={() => setDialogoContacto({ abierto: true, contacto: null })}><Plus /> Nuevo contacto</Button>
            </SoloRol>
          </CardHeader>
          <CardContent>
            {cliente.contactos.length === 0 ? (
              <Vacio titulo="Sin contactos">Agregá con quién se comunica la organizadora.</Vacio>
            ) : (
              <ul className="divide-y">
                {cliente.contactos.map((ct) => (
                  <li key={ct.id_contacto} className="flex items-start justify-between gap-3 py-3">
                    <div className={ct.vigente ? "" : "text-muted-foreground"}>
                      <p className="flex items-center gap-2 font-medium">
                        {ct.nombre}
                        {ct.vigente && <Badge><CheckCircle2 /> Vigente</Badge>}
                      </p>
                      {ct.rol && <p className="text-sm">{ct.rol}</p>}
                      <p className="text-muted-foreground text-sm">{[ct.telefono, ct.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}</p>
                    </div>
                    <SoloRol roles={GESTION}>
                      <div className="flex shrink-0 gap-1">
                        {!ct.vigente && <Button variant="ghost" size="sm" onClick={() => marcarVigente(ct)}>Marcar vigente</Button>}
                        <Button variant="ghost" size="sm" onClick={() => setDialogoContacto({ abierto: true, contacto: ct })}><Pencil /></Button>
                      </div>
                    </SoloRol>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Eventos</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {cliente.eventos.length === 0 ? (
              <Vacio titulo="Sin eventos">Todavía no encargó ningún evento.</Vacio>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Evento</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {cliente.eventos.map((ev) => (
                    <TableRow key={ev.id_evento}>
                      <TableCell>
                        <Link to={`/eventos/${ev.id_evento}`} className="font-medium hover:underline">{ev.nombre}</Link>
                        <p className="text-muted-foreground text-xs">{ev.tipo_evento}</p>
                      </TableCell>
                      <TableCell>{formatearFecha(ev.fecha)}</TableCell>
                      <TableCell><EstadoBadge estado={ev.estado} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ClienteDialog abierto={editarCliente} cliente={cliente} onCerrar={() => setEditarCliente(false)} onGuardado={cargar} />
      <ContactoDialog abierto={dialogoContacto.abierto} contacto={dialogoContacto.contacto} idCliente={cliente.id_cliente}
        onCerrar={() => setDialogoContacto({ abierto: false, contacto: null })} onGuardado={cargar} />
    </>
  );
}

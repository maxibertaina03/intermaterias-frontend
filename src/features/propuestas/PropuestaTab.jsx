import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EstadoBadge from "@/components/common/EstadoBadge";
import { Cargando, MensajeError, Vacio } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import {
  aceptarPropuesta,
  actualizarPropuesta,
  agregarItem,
  crearPropuesta,
  eliminarItem,
  obtenerPropuestaDeEvento,
  obtenerServicios,
  presentarPropuesta,
  rechazarPropuesta
} from "./propuestasService";

const ESTADOS_EDITABLES = ["en_preparacion", "rechazada", "vencida"];

export default function PropuestaTab({ evento }) {
  const idEvento = evento?.id_evento;
  const [propuesta, setPropuesta] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [descuento, setDescuento] = useState("0");
  const [condiciones, setCondiciones] = useState("");
  const [servicio, setServicio] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarPropuesta = useCallback(async () => {
    if (!idEvento) return;
    try {
      const { data } = await obtenerPropuestaDeEvento(idEvento);
      setPropuesta(data);
      setDescuento(String(data.descuento ?? 0));
      setCondiciones(data.condiciones ?? "");
      setError("");
    } catch (e) {
      if (e.response?.status === 404) {
        setPropuesta(null);
        setError("");
      } else {
        setError(mensajeDeError(e, "No se pudo cargar la propuesta"));
      }
    } finally {
      setCargando(false);
    }
  }, [idEvento]);

  useEffect(() => {
    cargarPropuesta();
    obtenerServicios()
      .then(({ data }) => setServicios(data.filter((item) => item.activo !== false)))
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar los servicios")));
  }, [cargarPropuesta]);

  const ejecutar = async (accion, mensaje) => {
    setGuardando(true);
    try {
      await accion();
      await cargarPropuesta();
      toast.success(mensaje);
    } catch (e) {
      toast.error(mensajeDeError(e, "No se pudo guardar la propuesta"));
    } finally {
      setGuardando(false);
    }
  };

  const handleCrear = () => ejecutar(async () => {
    await crearPropuesta(idEvento);
    await cargarPropuesta();
  }, "Se creó la propuesta");

  const handleGuardar = () => ejecutar(
    () => actualizarPropuesta(propuesta.id_propuesta, { descuento: Number(descuento), condiciones: condiciones.trim() || null }),
    "Se guardaron los cambios"
  );

  const handleAgregarItem = (event) => {
    event.preventDefault();
    const seleccionado = servicios.find((item) => String(item.id_servicio) === servicio);
    if (!seleccionado || Number(cantidad) < 1 || Number(precio || seleccionado.precio_referencia) < 0) {
      toast.error("Completá un servicio, cantidad y precio válidos");
      return;
    }
    ejecutar(async () => {
      await agregarItem(propuesta.id_propuesta, {
        id_servicio: Number(servicio),
        descripcion: descripcion.trim() || null,
        cantidad: Number(cantidad),
        precio_unitario: Number(precio || seleccionado.precio_referencia)
      });
      setServicio("");
      setCantidad("1");
      setPrecio("");
      setDescripcion("");
    }, "Se agregó el servicio");
  };

  const handleEliminarItem = (idItem) => ejecutar(
    () => eliminarItem(propuesta.id_propuesta, idItem),
    "Se quitó el servicio"
  );

  const handleTransicion = (accion, mensaje) => ejecutar(accion, mensaje);
  const editable = propuesta && ESTADOS_EDITABLES.includes(propuesta.estado);

  if (cargando) return <Cargando />;
  if (error) return <MensajeError>{error}</MensajeError>;
  if (!propuesta) {
    return (
      <Vacio titulo="Todavía no hay una propuesta para este evento">
        <span className="mt-3 inline-flex">
          <Button onClick={handleCrear} disabled={guardando}><Plus /> Crear propuesta</Button>
        </span>
      </Vacio>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Propuesta #{propuesta.id_propuesta}</CardTitle>
          <EstadoBadge estado={propuesta.estado} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" type="number" min="0" step="0.01" value={descuento} disabled={!editable}
                onChange={(event) => setDescuento(event.target.value)} />
            </div>
            <div>
              <Label>Vencimiento</Label>
              <p className="mt-2 text-sm">{propuesta.fecha_presentacion
                ? formatearFecha(new Date(new Date(propuesta.fecha_presentacion).getTime() + propuesta.vigencia_dias * 86400000))
                : "Se define al presentar"}</p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="condiciones">Condiciones</Label>
              <textarea id="condiciones" className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                value={condiciones} disabled={!editable} onChange={(event) => setCondiciones(event.target.value)} />
            </div>
          </div>
          {editable && <Button onClick={handleGuardar} disabled={guardando}>Guardar condiciones</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Servicios incluidos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {propuesta.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Agregá los servicios que forman parte de la propuesta.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Servicio</TableHead><TableHead>Descripción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Precio</TableHead>
                {editable && <TableHead />}
              </TableRow></TableHeader>
              <TableBody>
                {propuesta.items.map((item) => (
                  <TableRow key={item.id_item}>
                    <TableCell className="font-medium">{item.nombre_servicio}</TableCell>
                    <TableCell>{item.descripcion || "—"}</TableCell>
                    <TableCell className="text-right">{item.cantidad}</TableCell>
                    <TableCell className="text-right">{formatearPesos(item.precio_unitario)}</TableCell>
                    {editable && <TableCell className="text-right">
                      <ConfirmDialog titulo="¿Quitar este servicio?" descripcion="El total de la propuesta se actualizará."
                        textoConfirmar="Quitar" onConfirmar={() => handleEliminarItem(item.id_item)}>
                        <Button variant="ghost" size="sm" aria-label="Quitar servicio"><Trash2 /></Button>
                      </ConfirmDialog>
                    </TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-end gap-8 border-t pt-4 text-sm">
            <span>Subtotal <strong>{formatearPesos(propuesta.subtotal)}</strong></span>
            <span>Descuento <strong>{formatearPesos(propuesta.descuento)}</strong></span>
            <span className="text-base">Total <strong>{formatearPesos(propuesta.total)}</strong></span>
          </div>
          {editable && (
            <form onSubmit={handleAgregarItem} className="grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2 lg:col-span-2">
                <Label>Servicio</Label>
                <Select value={servicio} onValueChange={(value) => {
                  setServicio(value);
                  const item = servicios.find((serv) => String(serv.id_servicio) === value);
                  setPrecio(item?.precio_referencia == null ? "" : String(item.precio_referencia));
                }}>
                  <SelectTrigger aria-label="Servicio"><SelectValue placeholder="Elegir servicio" /></SelectTrigger>
                  <SelectContent>
                    {servicios.map((item) => <SelectItem key={item.id_servicio} value={String(item.id_servicio)}>{item.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="cantidad">Cantidad</Label>
                <Input id="cantidad" type="number" min="1" value={cantidad} onChange={(event) => setCantidad(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="precio">Precio unitario</Label>
                <Input id="precio" type="number" min="0" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-5">
                <Label htmlFor="descripcion-item">Descripción (opcional)</Label>
                <Input id="descripcion-item" value={descripcion} onChange={(event) => setDescripcion(event.target.value)} maxLength={200} />
              </div>
              <div className="lg:col-span-5"><Button type="submit" disabled={guardando || !servicios.length}><Plus /> Agregar servicio</Button></div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-3">
        {editable && <Button onClick={() => handleTransicion(
          () => presentarPropuesta(propuesta.id_propuesta), "Se presentó la propuesta"
        )} disabled={guardando || !propuesta.items.length}>Presentar</Button>}
        {propuesta.estado === "presentada" && <>
          <Button onClick={() => handleTransicion(
            () => aceptarPropuesta(propuesta.id_propuesta), "Se aceptó la propuesta"
          )} disabled={guardando}>Aceptar</Button>
          <div className="flex min-w-56 flex-1 items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="motivo-rechazo">Motivo de rechazo (opcional)</Label>
              <Input id="motivo-rechazo" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
            </div>
            <ConfirmDialog titulo="¿Rechazar la propuesta?" descripcion="El evento quedará marcado como no aceptado."
              textoConfirmar="Rechazar" onConfirmar={() => handleTransicion(
                () => rechazarPropuesta(propuesta.id_propuesta, motivo.trim() || null), "Se rechazó la propuesta"
              )}>
              <Button variant="destructive" disabled={guardando}>Rechazar</Button>
            </ConfirmDialog>
          </div>
        </>}
      </div>
    </div>
  );
}

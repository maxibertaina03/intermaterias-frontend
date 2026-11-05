import { Badge } from "@/components/ui/badge";
import { etiquetaEstado } from "@/lib/formato";

// Color según el tipo de estado: así todos los estados se ven igual en todo el sistema.
// Tonos suaves (fondo claro + texto oscuro del mismo color), con la paleta del sistema.
const TONOS = {
  gris: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-50 text-indigo-700",
  turquesa: "bg-teal-50 text-teal-700",
  violeta: "bg-purple-50 text-purple-700",
  verde: "bg-emerald-50 text-emerald-700",
  ambar: "bg-amber-50 text-amber-800",
  rojo: "bg-red-50 text-red-700",
};

const TONO_POR_ESTADO = {
  // Solicitud / evento
  recibida: "gris",
  falta_informacion: "ambar",
  propuesta_enviada: "indigo",
  confirmado: "turquesa",
  en_preparacion: "violeta",
  realizado: "verde",
  no_aceptada: "rojo",
  cancelado: "rojo",
  // Propuesta
  presentada: "indigo",
  aceptada: "verde",
  rechazada: "rojo",
  vencida: "rojo",
  // Servicios y tareas
  pendiente: "ambar",
  confirmada: "verde",
  en_curso: "violeta",
  hecha: "verde",
  // Invitados
  va: "turquesa",
  no_va: "gris",
  verificado: "verde",
  // Activo / inactivo
  activa: "verde",
  activo: "verde",
  inactiva: "gris",
  inactivo: "gris",
};

export default function EstadoBadge({ estado }) {
  const tono = TONOS[TONO_POR_ESTADO[estado] ?? "gris"];
  return <Badge variant="secondary" className={tono}>{etiquetaEstado(estado)}</Badge>;
}

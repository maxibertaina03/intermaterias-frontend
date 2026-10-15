import { Badge } from "@/components/ui/badge";
import { etiquetaEstado } from "@/lib/formato";

// Color según el tipo de estado: así todos los estados se ven igual en todo el sistema.
const VARIANTE = {
  confirmado: "default", aceptada: "default", realizado: "default", hecha: "default", activa: "default",
  cancelado: "destructive", rechazada: "destructive", no_aceptada: "destructive", vencida: "destructive", inactiva: "destructive",
};

export default function EstadoBadge({ estado }) {
  return <Badge variant={VARIANTE[estado] || "secondary"}>{etiquetaEstado(estado)}</Badge>;
}

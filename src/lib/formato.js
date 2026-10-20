// Formatos comunes para mostrar datos. Usar SIEMPRE estos para que todo se vea igual.

const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

// 2090000 → "$ 2.090.000,00"
export const formatearPesos = (valor) =>
  valor === null || valor === undefined ? "—" : pesos.format(Number(valor));

// "2027-03-20" o un timestamp → "20/03/2027"
export const formatearFecha = (valor) => {
  if (!valor) return "—";
  const fecha = typeof valor === "string" && valor.length === 10 ? new Date(`${valor}T00:00:00`) : new Date(valor);
  return fecha.toLocaleDateString("es-AR");
};

// "falta_informacion" → "Falta información" (para estados de la base)
const ETIQUETAS = {
  recibida: "Recibida",
  falta_informacion: "Falta información",
  propuesta_enviada: "Propuesta enviada",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  realizado: "Realizado",
  no_aceptada: "No aceptada",
  cancelado: "Cancelado",
  presentada: "Presentada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  vencida: "Vencida",
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_curso: "En curso",
  hecha: "Hecha",
  activa: "Activa",
  inactiva: "Inactiva"
};
export const etiquetaEstado = (estado) => ETIQUETAS[estado] || estado;

// "responsable_propuesta" → "Responsable de propuesta"
const ROLES = {
  admin_empresa: "Administrador de la empresa",
  atencion_cliente: "Atención al cliente",
  responsable_propuesta: "Responsable de propuesta",
  responsable_organizacion: "Responsable de organización",
  integrante: "Integrante"
};
export const etiquetaRol = (rol) => ROLES[rol] || rol;

import api from "@/lib/api";

export const obtenerEventos = (params) => api.get("/eventos", { params });
export const obtenerEvento = (id) => api.get(`/eventos/${id}`);
export const crearEvento = (evento) => api.post("/eventos", evento);
export const actualizarEvento = (id, evento) => api.put(`/eventos/${id}`, evento);
export const obtenerCambiosEvento = (id) => api.get(`/eventos/${id}/cambios`);
export const cambiarEstadoEvento = (id, estado, observaciones_cierre) =>
  api.patch(`/eventos/${id}/estado`, { estado, observaciones_cierre });
export const cancelarEvento = (id, motivo) => api.post(`/eventos/${id}/cancelar`, { motivo });

export const ESTADOS_EVENTO = [
  "recibida", "falta_informacion", "propuesta_enviada", "confirmado",
  "en_preparacion", "realizado", "no_aceptada", "cancelado",
];

import api from "@/lib/api";

export const obtenerPropuestas = (params) => api.get("/propuestas", { params });
export const obtenerPropuestaDeEvento = (idEvento) => api.get(`/propuestas/evento/${idEvento}`);
export const obtenerServicios = () => api.get("/servicios");
export const crearPropuesta = (id_evento) => api.post("/propuestas", { id_evento });
export const actualizarPropuesta = (id, datos) => api.put(`/propuestas/${id}`, datos);
export const agregarItem = (id, item) => api.post(`/propuestas/${id}/items`, item);
export const actualizarItem = (id, idItem, item) => api.put(`/propuestas/${id}/items/${idItem}`, item);
export const eliminarItem = (id, idItem) => api.delete(`/propuestas/${id}/items/${idItem}`);
export const presentarPropuesta = (id) => api.post(`/propuestas/${id}/presentar`);
export const aceptarPropuesta = (id) => api.post(`/propuestas/${id}/aceptar`);
export const rechazarPropuesta = (id, motivo) => api.post(`/propuestas/${id}/rechazar`, { motivo });

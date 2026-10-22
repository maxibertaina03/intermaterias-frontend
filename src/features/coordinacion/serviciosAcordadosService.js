import api from "@/lib/api";

export const obtenerServiciosAcordados = (evento) => api.get("/servicios-acordados", { params: { evento } });
export const actualizarServicioAcordado = (id, datos) => api.put(`/servicios-acordados/${id}`, datos);
export const confirmarServicioAcordado = (id) => api.post(`/servicios-acordados/${id}/confirmar`);

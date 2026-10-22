import api from "@/lib/api";

export const obtenerServicios = () => api.get("/servicios");
export const crearServicio = (datos) => api.post("/servicios", datos);
export const actualizarServicio = (id, datos) => api.put(`/servicios/${id}`, datos);
export const eliminarServicio = (id) => api.delete(`/servicios/${id}`);

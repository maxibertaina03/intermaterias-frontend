import api from "@/lib/api";

export const obtenerTiposEvento = () => api.get("/tipos-evento");
export const crearTipoEvento = (nombre) => api.post("/tipos-evento", { nombre });
export const actualizarTipoEvento = (id, nombre) => api.put(`/tipos-evento/${id}`, { nombre });
export const eliminarTipoEvento = (id) => api.delete(`/tipos-evento/${id}`);

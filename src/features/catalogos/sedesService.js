import api from "@/lib/api";

export const obtenerSedes = () => api.get("/sedes");
export const crearSede = (sede) => api.post("/sedes", sede);
export const actualizarSede = (id, sede) => api.put(`/sedes/${id}`, sede);
export const eliminarSede = (id) => api.delete(`/sedes/${id}`);

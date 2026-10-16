import api from "@/lib/api";

export const obtenerTareas = (params) => api.get("/tareas", { params });
export const crearTarea = (tarea) => api.post("/tareas", tarea);
export const actualizarTarea = (id, tarea) => api.put(`/tareas/${id}`, tarea);
export const eliminarTarea = (id) => api.delete(`/tareas/${id}`);
export const obtenerPendientes = () => api.get("/pendientes");

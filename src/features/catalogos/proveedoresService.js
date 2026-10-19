import api from "@/lib/api";

export const obtenerProveedores = () => api.get("/proveedores");
export const crearProveedor = (datos) => api.post("/proveedores", datos);
export const actualizarProveedor = (id, datos) => api.put(`/proveedores/${id}`, datos);
export const actualizarServiciosProveedor = (id, id_servicios) => api.put(`/proveedores/${id}/servicios`, { id_servicios });
export const eliminarProveedor = (id) => api.delete(`/proveedores/${id}`);

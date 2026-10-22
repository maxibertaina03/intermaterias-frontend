import api from "@/lib/api";

export const obtenerUsuarios = () => api.get("/usuarios");
export const crearUsuario = (datos) => api.post("/usuarios", datos);
export const actualizarUsuario = (id, datos) => api.put(`/usuarios/${id}`, datos);

import api from "@/lib/api";

// Una función por endpoint. Los componentes nunca escriben URLs: llaman a estas funciones.
export const obtenerEmpresas = () => api.get("/empresas");
export const obtenerEmpresa = (id) => api.get(`/empresas/${id}`);
export const crearEmpresa = (empresa) => api.post("/empresas", empresa);
export const actualizarEmpresa = (id, empresa) => api.put(`/empresas/${id}`, empresa);
export const eliminarEmpresa = (id) => api.delete(`/empresas/${id}`);

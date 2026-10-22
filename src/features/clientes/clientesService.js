import api from "@/lib/api";

export const obtenerClientes = (params) => api.get("/clientes", { params });
export const obtenerCliente = (id) => api.get(`/clientes/${id}`);
export const crearCliente = (cliente) => api.post("/clientes", cliente);
export const actualizarCliente = (id, cliente) => api.put(`/clientes/${id}`, cliente);
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`);

export const crearContacto = (idCliente, contacto) => api.post(`/clientes/${idCliente}/contactos`, contacto);
export const actualizarContacto = (idCliente, idContacto, contacto) =>
  api.put(`/clientes/${idCliente}/contactos/${idContacto}`, contacto);

export const TIPOS_CLIENTE = {
  centro_estudiantes: "Centro de estudiantes",
  grupo_estudiantes: "Grupo de estudiantes",
  curso: "Curso",
};

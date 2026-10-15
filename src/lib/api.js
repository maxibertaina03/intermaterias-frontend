import axios from "axios";

// Única instancia de axios de todo el front.
// Los servicios de cada área la importan: import api from "@/lib/api";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Login (Clerk): cuando esté, este interceptor agrega el token a cada pedido.
// La función la registra el componente de login con setTokenGetter(getToken).
let getToken = null;
export const setTokenGetter = (fn) => {
  getToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (getToken) {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mensaje de error listo para mostrar: el que manda la API o uno genérico
export const mensajeDeError = (error, porDefecto = "Ocurrió un error") =>
  error.response?.data?.mensaje || porDefecto;

export default api;

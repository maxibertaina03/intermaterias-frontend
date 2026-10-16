import { createContext, useContext } from "react";

// Datos del usuario logueado (los devuelve GET /api/me):
// { id_usuario, id_empresa, nombre, email, roles: ["atencion_cliente", ...] }
export const UsuarioContext = createContext(null);

// Uso en cualquier componente:
//   const { usuario, tieneRol } = useUsuario();
//   {tieneRol("responsable_propuesta") && <Button>Aceptar</Button>}
export function useUsuario() {
  const usuario = useContext(UsuarioContext);
  const tieneRol = (...roles) => Boolean(usuario?.roles?.some((rol) => roles.includes(rol)));
  return { usuario, tieneRol };
}

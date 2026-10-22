import { createContext, useContext } from "react";

// Datos del usuario logueado (los devuelve GET /api/me):
// { id_usuario, id_empresa, empresa, nombre, email, usuario, es_superadmin, roles: ["admin_empresa", ...] }
// El super admin no tiene empresa (id_empresa null): solo administra empresas.
export const UsuarioContext = createContext(null);

// Uso en cualquier componente:
//   const { usuario, tieneRol } = useUsuario();
//   {tieneRol("responsable_propuesta") && <Button>Aceptar</Button>}
export function useUsuario() {
  const usuario = useContext(UsuarioContext);
  const tieneRol = (...roles) => Boolean(usuario?.roles?.some((rol) => roles.includes(rol)));
  const esSuperAdmin = Boolean(usuario?.es_superadmin);
  return { usuario, tieneRol, esSuperAdmin };
}

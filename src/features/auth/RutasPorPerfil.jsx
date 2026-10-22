import { Navigate, Outlet } from "react-router-dom";
import { useUsuario } from "./UsuarioContext";

// Rutas de datos de una empresa: el super admin no tiene empresa, va a Empresas.
export function SoloEmpresa() {
  const { esSuperAdmin } = useUsuario();
  return esSuperAdmin ? <Navigate to="/empresas" replace /> : <Outlet />;
}

// Administración de empresas: solo el super admin.
export function SoloSuperAdmin() {
  const { esSuperAdmin } = useUsuario();
  return esSuperAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

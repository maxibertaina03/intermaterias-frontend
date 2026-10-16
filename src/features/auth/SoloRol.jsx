import { useUsuario } from "./UsuarioContext";

// Muestra su contenido solo si el usuario tiene ALGUNO de los roles.
// <SoloRol roles={["responsable_propuesta"]}><Button>Aceptar propuesta</Button></SoloRol>
export default function SoloRol({ roles, children }) {
  const { tieneRol } = useUsuario();
  return tieneRol(...roles) ? children : null;
}

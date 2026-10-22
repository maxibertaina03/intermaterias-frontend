import AuthLayout from "./AuthLayout";
import IniciarSesion from "./IniciarSesion";

// Login propio (con los hooks de Clerk y componentes de shadcn): sin las pantallas por defecto de Clerk.
// No hay registro público: los usuarios los crea el administrador de cada empresa.
export default function LoginPage() {
  return (
    <AuthLayout titulo="Iniciá sesión" descripcion="Entrá con tu usuario y contraseña.">
      <IniciarSesion />
    </AuthLayout>
  );
}

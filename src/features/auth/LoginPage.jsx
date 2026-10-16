import { useState } from "react";
import AuthLayout from "./AuthLayout";
import CrearCuenta from "./CrearCuenta";
import IniciarSesion from "./IniciarSesion";
import RecuperarContrasena from "./RecuperarContrasena";

const PANTALLAS = {
  login: { titulo: "Iniciá sesión", descripcion: "Entrá con el email que te registró la empresa.", Componente: IniciarSesion },
  registro: { titulo: "Creá tu cuenta", descripcion: "Solo para el personal dado de alta por la empresa.", Componente: CrearCuenta },
  recuperar: { titulo: "Recuperá tu contraseña", descripcion: "Te mandamos un código por email para crear una nueva.", Componente: RecuperarContrasena },
};

// Login propio (con los hooks de Clerk y componentes de shadcn): sin las pantallas por defecto de Clerk.
export default function LoginPage() {
  const [pantalla, setPantalla] = useState("login");
  const { titulo, descripcion, Componente } = PANTALLAS[pantalla];
  return (
    <AuthLayout titulo={titulo} descripcion={descripcion}>
      <Componente key={pantalla} irA={setPantalla} />
    </AuthLayout>
  );
}

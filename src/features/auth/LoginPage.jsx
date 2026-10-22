import { useState } from "react";
import AuthLayout from "./AuthLayout";
import CrearCuenta from "./CrearCuenta";
import IniciarSesion from "./IniciarSesion";

const PANTALLAS = {
  login: { titulo: "Iniciá sesión", descripcion: "Entrá con tu usuario y contraseña.", Componente: IniciarSesion },
  registro: { titulo: "Creá tu cuenta", descripcion: "Para el personal de la organizadora.", Componente: CrearCuenta },
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

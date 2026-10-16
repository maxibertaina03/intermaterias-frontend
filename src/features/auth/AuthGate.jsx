import { Show, useAuth } from "@clerk/react";
import { setTokenGetter } from "@/lib/api";
import { usaClerk } from "./clerk";
import CargarUsuario from "./CargarUsuario";
import LoginPage from "./LoginPage";

// Registra el token de Clerk en axios: así cada pedido a la API va autenticado.
function ConToken({ children }) {
  const { getToken } = useAuth();
  setTokenGetter(getToken);
  return children;
}

// Puerta de entrada: sin sesión → login; con sesión → carga el usuario y muestra la app.
export default function AuthGate({ children }) {
  if (!usaClerk) return <CargarUsuario>{children}</CargarUsuario>; // modo desarrollo

  return (
    <>
      <Show when="signed-out"><LoginPage /></Show>
      <Show when="signed-in">
        <ConToken><CargarUsuario>{children}</CargarUsuario></ConToken>
      </Show>
    </>
  );
}

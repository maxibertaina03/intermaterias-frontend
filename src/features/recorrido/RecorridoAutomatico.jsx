import { useEffect, useRef } from "react";
import { useUsuario } from "@/features/auth/UsuarioContext";
import { iniciarRecorrido } from "./recorrido";

// La primera vez que alguien entra (recorrido_visto = false) le abre el recorrido de bienvenida.
export default function RecorridoAutomatico() {
  const datos = useUsuario();
  const actuales = useRef(datos);
  const yaAbierto = useRef(false);
  actuales.current = datos;

  // Depende solo del usuario: un re-render (por ejemplo, la redirección del super admin a Empresas)
  // no cancela la espera. Se abre una sola vez por sesión.
  const { usuario } = datos;
  useEffect(() => {
    if (!usuario || usuario.recorrido_visto || yaAbierto.current) return;
    yaAbierto.current = true;
    // Espera a que la pantalla termine de dibujarse para poder resaltar el menú
    setTimeout(() => iniciarRecorrido(actuales.current), 700);
  }, [usuario]);

  return null;
}

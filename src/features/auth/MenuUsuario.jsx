import { UserButton } from "@clerk/react";
import { etiquetaRol } from "@/lib/formato";
import { usaClerk } from "./clerk";
import { useUsuario } from "./UsuarioContext";

// Barra superior: quién está usando el sistema, sus roles y "salir".
export default function MenuUsuario() {
  const { usuario } = useUsuario();
  if (!usuario) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-sm font-medium">{usuario.nombre}</p>
        <p className="text-muted-foreground text-xs">
          {usuario.roles.map(etiquetaRol).join(" · ") || "Sin roles"}
          {!usaClerk && " · modo desarrollo"}
        </p>
      </div>
      {usaClerk && <UserButton />}
    </div>
  );
}

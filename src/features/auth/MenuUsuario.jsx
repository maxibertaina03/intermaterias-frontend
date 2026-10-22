import { useClerk } from "@clerk/react";
import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { etiquetaRol } from "@/lib/formato";
import { usaClerk } from "./clerk";
import { useUsuario } from "./UsuarioContext";

const iniciales = (nombre = "") =>
  nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

function BotonSalir() {
  const { signOut } = useClerk();
  return (
    <DropdownMenuItem onSelect={() => signOut()} className="text-destructive focus:text-destructive">
      <LogOut /> Cerrar sesión
    </DropdownMenuItem>
  );
}

// Barra superior: quién usa el sistema, sus roles y "cerrar sesión" (menú propio con shadcn).
export default function MenuUsuario() {
  const { usuario } = useUsuario();
  if (!usuario) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-accent flex items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-xs font-semibold">
          {iniciales(usuario.nombre)}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-medium">{usuario.nombre}</span>
          <span className="text-muted-foreground block text-xs">{usuario.email}</span>
        </span>
        <ChevronDown className="text-muted-foreground size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium">{usuario.nombre}</p>
          <p className="text-muted-foreground text-xs">{usuario.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Roles: {usuario.roles.map(etiquetaRol).join(", ") || "sin roles"}
          {!usaClerk && " · modo desarrollo"}
        </DropdownMenuLabel>
        {usaClerk && (<><DropdownMenuSeparator /><BotonSalir /></>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

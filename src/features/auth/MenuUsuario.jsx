import { useClerk } from "@clerk/react";
import { ChevronDown, Compass, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { etiquetaRol } from "@/lib/formato";
import { usaClerk } from "./clerk";
import { useUsuario } from "./UsuarioContext";
import { iniciarRecorrido } from "@/features/recorrido/recorrido";

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
  const { usuario, tieneRol, esSuperAdmin } = useUsuario();
  if (!usuario) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-tour="menu-usuario" className="flex items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40">
        <span className="bg-coral flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white">
          {iniciales(usuario.nombre)}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-medium">{usuario.nombre}</span>
          <span className="block text-xs text-indigo-200">{usuario.empresa ?? "Super admin"}</span>
        </span>
        <ChevronDown className="size-4 text-indigo-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium">{usuario.nombre}</p>
          <p className="text-muted-foreground text-xs">
            {usuario.usuario && `@${usuario.usuario} · `}{usuario.empresa ?? "Super admin"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Roles: {usuario.roles.map(etiquetaRol).join(", ") || (usuario.es_superadmin ? "administra las empresas" : "sin roles")}
          {!usaClerk && " · modo desarrollo"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Espera a que se cierre el menú para poder resaltar la pantalla */}
        <DropdownMenuItem onSelect={() => setTimeout(() => iniciarRecorrido({ usuario, tieneRol, esSuperAdmin }), 250)}>
          <Compass /> Ver el recorrido
        </DropdownMenuItem>
        {usaClerk && <BotonSalir />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

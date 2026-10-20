import { NavLink, Outlet } from "react-router-dom";
import {
  Building2, CalendarDays, ClipboardList, FileText, LayoutDashboard, MapPin, Shapes, Truck, UserCog, Users, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MenuUsuario from "@/features/auth/MenuUsuario";
import { useUsuario } from "@/features/auth/UsuarioContext";

// Menú lateral: agrupado por las áreas del sistema. Un ítem con `rol` solo lo ve quien tiene ese rol.
// Si agregás una página nueva al menú, agregala acá (y su ruta en App.jsx).
const SECCIONES_EMPRESA = [
  { titulo: "Seguimiento", items: [
    { to: "/", label: "Pendientes", icono: LayoutDashboard, end: true },
    { to: "/tareas", label: "Tareas", icono: ClipboardList },
  ] },
  { titulo: "Encargos", items: [
    { to: "/eventos", label: "Solicitudes y eventos", icono: CalendarDays },
    { to: "/clientes", label: "Clientes", icono: Users },
    { to: "/propuestas", label: "Propuestas", icono: FileText },
  ] },
  { titulo: "Catálogos", items: [
    { to: "/servicios", label: "Servicios", icono: Wrench },
    { to: "/proveedores", label: "Proveedores", icono: Truck },
    { to: "/sedes", label: "Sedes", icono: MapPin },
    { to: "/tipos-evento", label: "Tipos de evento", icono: Shapes },
  ] },
  { titulo: "Administración", items: [
    { to: "/usuarios", label: "Usuarios", icono: UserCog, rol: "admin_empresa" },
  ] },
];

// El super admin no tiene empresa: solo administra las empresas.
const SECCIONES_SUPERADMIN = [
  { titulo: "Administración", items: [
    { to: "/empresas", label: "Empresas", icono: Building2 },
  ] },
];

export default function AppLayout() {
  const { usuario, tieneRol, esSuperAdmin } = useUsuario();
  const secciones = (esSuperAdmin ? SECCIONES_SUPERADMIN : SECCIONES_EMPRESA)
    .map((seccion) => ({ ...seccion, items: seccion.items.filter((item) => !item.rol || tieneRol(item.rol)) }))
    .filter((seccion) => seccion.items.length);

  return (
    <div className="bg-muted/30 flex min-h-screen">
      {/* Fijo: al bajar en una página larga, el menú queda en su lugar */}
      <aside className="bg-background sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-b px-5 py-4">
          <p className="font-semibold">Eventos estudiantiles</p>
          <p className="text-muted-foreground text-xs">Sistema de gestión</p>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {secciones.map((seccion) => (
            <div key={seccion.titulo}>
              <p className="text-muted-foreground px-2 pb-1 text-xs font-medium uppercase">{seccion.titulo}</p>
              {seccion.items.map(({ to, label, icono: Icono, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/60"
                  )}>
                  <Icono className="size-4" /> {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <p className="text-muted-foreground border-t px-5 py-3 text-xs">Versión {import.meta.env.VITE_APP_VERSION}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-14 items-center justify-between gap-4 border-b px-6">
          <p className="truncate text-sm font-medium">
            {esSuperAdmin ? "Administración del sistema" : usuario?.empresa}
          </p>
          <MenuUsuario />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

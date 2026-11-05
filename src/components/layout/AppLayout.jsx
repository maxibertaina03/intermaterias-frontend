import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Building2, CalendarDays, ChevronDown, ClipboardList, FileText, Gift, LayoutDashboard, Lock, MapPin, Shapes, Truck, UserCog, Users, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MenuUsuario from "@/features/auth/MenuUsuario";
import { useUsuario } from "@/features/auth/UsuarioContext";
import { formatearFecha } from "@/lib/formato";

// Secciones del menú que el usuario dejó cerradas (se recuerdan en este navegador)
const CLAVE_CERRADAS = "menu-secciones-cerradas";
const leerCerradas = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE_CERRADAS)) ?? []; } catch { return []; }
};
const guardarCerradas = (lista) => {
  try { localStorage.setItem(CLAVE_CERRADAS, JSON.stringify(lista)); } catch { /* sin almacenamiento: no se recuerda */ }
};

// Un grupo del menú: el título abre y cierra sus opciones, con una transición suave
function SeccionMenu({ seccion, abierta, onToggle }) {
  return (
    <div>
      <button type="button" onClick={onToggle} aria-expanded={abierta}
        className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors">
        {seccion.titulo}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", !abierta && "-rotate-90")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows,opacity] duration-200 ease-out", abierta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="pt-1">
            {seccion.items.map(({ to, label, icono: Icono, end }) => (
              <NavLink key={to} to={to} end={end} tabIndex={abierta ? undefined : -1}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/60"
                )}>
                <Icono className="size-4" /> {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Aviso de la prueba gratuita: días que quedan o, si venció, que está en solo lectura
function AvisoPrueba({ usuario }) {
  if (!usuario?.fecha_fin_prueba) return null;
  if (usuario.prueba_vencida) {
    return (
      <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-6 py-2 text-sm text-red-800">
        <Lock className="size-4 shrink-0" />
        Tu prueba gratuita terminó el {formatearFecha(usuario.fecha_fin_prueba)}: podés ver tus datos, pero no cargar ni modificar. Próximamente vas a poder suscribirte.
      </div>
    );
  }
  const dias = Number(usuario.dias_prueba);
  return (
    <div className="flex items-center gap-2 border-b border-orange-200 bg-orange-50 px-6 py-2 text-sm text-orange-900">
      <Gift className="text-coral size-4 shrink-0" />
      Prueba gratuita: {dias === 0 ? "hoy es el último día" : `te ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}`} (hasta el {formatearFecha(usuario.fecha_fin_prueba)}). Próximamente vas a poder suscribirte.
    </div>
  );
}

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
  const [cerradas, setCerradas] = useState(leerCerradas);
  const alternar = (titulo) => setCerradas((actuales) => {
    const nuevas = actuales.includes(titulo) ? actuales.filter((t) => t !== titulo) : [...actuales, titulo];
    guardarCerradas(nuevas);
    return nuevas;
  });

  return (
    <div className="bg-muted/30 flex min-h-screen">
      {/* Fijo: al bajar en una página larga, el menú queda en su lugar */}
      <aside className="bg-background sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r md:flex">
        {/* Marca sobre la barra índigo: continúa la barra superior */}
        <div className="bg-primary text-primary-foreground flex h-14 shrink-0 flex-col justify-center px-5">
          <p className="leading-tight font-semibold">Eventos estudiantiles</p>
          <p className="text-xs text-indigo-200">Sistema de gestión</p>
        </div>
        <nav className="flex-1 space-y-3 overflow-y-auto p-3">
          {secciones.map((seccion) => (
            <SeccionMenu key={seccion.titulo} seccion={seccion}
              abierta={!cerradas.includes(seccion.titulo)} onToggle={() => alternar(seccion.titulo)} />
          ))}
        </nav>
        <p className="text-muted-foreground border-t px-5 py-3 text-xs">Versión {import.meta.env.VITE_APP_VERSION}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-primary text-primary-foreground flex h-14 items-center justify-between gap-4 px-6 shadow-sm">
          <p className="truncate text-sm font-medium">
            {esSuperAdmin ? "Administración del sistema" : usuario?.empresa}
          </p>
          <MenuUsuario />
        </header>
        <AvisoPrueba usuario={usuario} />
        <main className="mx-auto w-full max-w-6xl flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

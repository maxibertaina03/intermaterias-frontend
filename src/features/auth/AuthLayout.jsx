import { CalendarHeart, CheckCircle2, ClipboardList, FileText, Truck } from "lucide-react";

const PUNTOS = [
  { icono: FileText, texto: "Propuestas con servicios, importes y vencimiento" },
  { icono: Truck, texto: "Proveedores y servicios coordinados en un solo lugar" },
  { icono: ClipboardList, texto: "Tareas, responsables y pendientes a la vista" },
  { icono: CheckCircle2, texto: "Todo el equipo sabe qué se acordó y qué falta" },
];

// Pantalla dividida: marca a la izquierda, formulario a la derecha.
export default function AuthLayout({ titulo, descripcion, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-zinc-950 p-12 text-zinc-50 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-40 -left-40 size-[34rem] rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 -bottom-48 size-[30rem] rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
            <CalendarHeart className="size-5" />
          </span>
          Eventos estudiantiles
        </div>

        <div className="relative max-w-md space-y-8">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight">
            Organizá cada evento, de la solicitud al cierre.
          </h2>
          <ul className="space-y-4">
            {PUNTOS.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-zinc-300">
                <Icono className="size-5 shrink-0 text-zinc-400" /> {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-zinc-500">Sistema de gestión para el personal de la organizadora</p>
      </aside>

      <main className="bg-background flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 font-semibold lg:hidden">
            <CalendarHeart className="size-5" /> Eventos estudiantiles
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
            {descripcion && <p className="text-muted-foreground text-sm">{descripcion}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

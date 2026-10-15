import { Skeleton } from "@/components/ui/skeleton";

// Estados de carga / error / vacío: la pantalla nunca queda en blanco.
export function Cargando({ filas = 3 }) {
  return (
    <div className="space-y-2" role="status" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  );
}

export function MensajeError({ children }) {
  return <p className="text-destructive rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm" role="alert">{children}</p>;
}

export function Vacio({ titulo, children }) {
  return (
    <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center">
      <p className="text-foreground font-medium">{titulo}</p>
      {children && <p className="mt-1 text-sm">{children}</p>}
    </div>
  );
}

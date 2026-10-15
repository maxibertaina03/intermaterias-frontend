import { Label } from "@/components/ui/label";

// Un campo de formulario: label + control + error debajo.
// Uso: <Campo id="nombre" label="Nombre" requerido error={errores.nombre}><Input id="nombre" … /></Campo>
export default function Campo({ id, label, requerido, error, children }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}{requerido && " *"}</Label>
      {children}
      {error && <p className="text-destructive text-sm" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

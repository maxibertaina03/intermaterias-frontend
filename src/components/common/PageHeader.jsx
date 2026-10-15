// Encabezado estándar de cada página: título, descripción y acciones (botones) a la derecha.
export default function PageHeader({ titulo, descripcion, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && <p className="text-muted-foreground mt-1 text-sm">{descripcion}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

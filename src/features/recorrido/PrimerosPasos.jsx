import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsuario } from "@/features/auth/UsuarioContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// "Primeros pasos": lista para el administrador de una empresa nueva. Cada paso se tilda solo
// según lo que la empresa ya cargó (GET /api/primeros-pasos). Desaparece al cerrarla.

// "Revisar servicios" no se puede deducir de los datos: se tilda al tocar su botón (en este navegador).
const claveServicios = (idEmpresa) => `primeros-pasos-servicios-${idEmpresa}`;
const leer = (clave) => { try { return localStorage.getItem(clave) === "1"; } catch { return false; } };
const guardar = (clave) => { try { localStorage.setItem(clave, "1"); } catch { /* sin almacenamiento */ } };

const PASOS = [
  { id: "servicios", titulo: "Revisá tus servicios y precios",
    texto: "Te dejamos 5 servicios de ejemplo: ajustá los precios y sumá los tuyos.", a: "/servicios", boton: "Ir a Servicios" },
  { id: "proveedores", titulo: "Cargá tus proveedores",
    texto: "Con qué proveedor resolvés cada servicio. Los de ejemplo no cuentan.", a: "/proveedores", boton: "Ir a Proveedores" },
  { id: "usuarios", titulo: "Sumá a alguien de tu equipo",
    texto: "Cada persona con su usuario y su rol.", a: "/usuarios", boton: "Ir a Usuarios" },
  { id: "clientes_con_contacto", titulo: "Creá tu primer cliente con su contacto",
    texto: "El centro de estudiantes y la persona con la que hablás.", a: "/clientes", boton: "Ir a Clientes" },
  { id: "eventos", titulo: "Registrá una solicitud",
    texto: "Tipo de evento, fecha, salón y cantidad de personas.", a: "/eventos/nuevo", boton: "Nueva solicitud" },
  { id: "propuestas_presentadas", titulo: "Armá y presentá una propuesta",
    texto: "Desde el evento, pestaña Propuesta: servicios, precios y Presentar.", a: "/eventos", boton: "Ir a Eventos" },
  { id: "invitaciones", titulo: "Generá el link de invitados",
    texto: "Con el evento confirmado, pestaña Invitados: el link para compartir por WhatsApp.", a: "/eventos", boton: "Ir a Eventos" },
];

export default function PrimerosPasos() {
  const { usuario, tieneRol } = useUsuario();
  const [progreso, setProgreso] = useState(null);
  const [cerrada, setCerrada] = useState(Boolean(usuario?.primeros_pasos_cerrado));
  const [serviciosVistos, setServiciosVistos] = useState(() => leer(claveServicios(usuario?.id_empresa)));
  const mostrar = usuario && tieneRol("admin_empresa") && !cerrada;

  useEffect(() => {
    if (!mostrar) return;
    api.get("/primeros-pasos").then(({ data }) => setProgreso(data)).catch(() => setProgreso(null));
  }, [mostrar]);

  if (!mostrar || !progreso) return null;

  const hecho = (id) => (id === "servicios" ? serviciosVistos : id === "usuarios" ? progreso.usuarios > 1 : progreso[id] > 0);
  const hechos = PASOS.filter((p) => hecho(p.id)).length;
  const completo = hechos === PASOS.length;
  const siguiente = PASOS.find((p) => !hecho(p.id));

  const cerrar = () => {
    setCerrada(true);
    api.patch("/me/recorrido", { primeros_pasos_cerrado: true }).catch(() => {});
  };

  return (
    <Card className="border-t-violeta mb-6 border-t-4">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Rocket className="size-4" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-base">{completo ? "¡Listo! Ya sabés usar el sistema" : "Primeros pasos"}</CardTitle>
            <CardDescription>
              {completo ? "Completaste todos los pasos. Podés ocultar esta lista." : `${hechos} de ${PASOS.length} · seguí la lista para cargar tu primer evento de punta a punta.`}
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={cerrar} aria-label="Ocultar primeros pasos" title="Ocultar"><X /></Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted h-2 overflow-hidden rounded-full" aria-hidden="true">
          <div className="bg-violeta h-full rounded-full transition-[width] duration-500" style={{ width: `${(hechos / PASOS.length) * 100}%` }} />
        </div>
        {completo ? <Button onClick={cerrar}>Ocultar la lista</Button> : (
          <ol className="grid gap-2 md:grid-cols-2">
            {PASOS.map((paso) => {
              const ok = hecho(paso.id);
              const actual = paso === siguiente;
              return (
                <li key={paso.id} className={cn("flex items-start gap-3 rounded-lg border p-3", actual && "border-violeta bg-purple-50/50", ok && "opacity-70")}>
                  {ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <Circle className="text-muted-foreground mt-0.5 size-5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium", ok && "line-through")}>{paso.titulo}</p>
                    <p className="text-muted-foreground text-xs">{paso.texto}</p>
                  </div>
                  {!ok && (
                    <Button asChild size="sm" variant={actual ? "default" : "outline"} className="shrink-0">
                      <Link to={paso.a} onClick={() => {
                        if (paso.id === "servicios") { guardar(claveServicios(usuario.id_empresa)); setServiciosVistos(true); }
                      }}>{paso.boton}</Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import api from "@/lib/api";

// Recorrido guiado de bienvenida (driver.js): resalta cada parte de la pantalla con un globo.
// Los elementos se marcan con data-tour="..." en AppLayout y MenuUsuario.
// Solo se muestran los pasos cuyo elemento está visible (por rol o en el celular, donde no hay menú lateral).

const visible = (selector) => {
  const el = document.querySelector(selector);
  return Boolean(el && el.getClientRects().length);
};

const pasosEmpresa = (usuario, tieneRol) => {
  const integrante = !tieneRol("admin_empresa", "atencion_cliente", "responsable_propuesta", "responsable_organizacion");
  return [
    { popover: {
      title: `¡Hola, ${usuario.nombre.split(" ")[0]}! 👋`,
      description: "Este sistema acompaña cada evento de <b>" + (usuario.empresa ?? "tu empresa") + "</b>, desde el pedido del centro de estudiantes hasta el cierre. Te mostramos las partes en un minuto.",
      showButtons: ["next", "close"],
    } },
    { element: '[data-tour="Seguimiento"]', popover: {
      title: "Seguimiento",
      description: integrante
        ? "En <b>Tareas</b> ves lo que tenés asignado y lo marcás cuando lo terminás. <b>Pendientes</b> te avisa lo que se está por vencer."
        : "<b>Pendientes</b> es lo primero que mirás cada día: propuestas por vencer, servicios sin confirmar y tareas atrasadas. En <b>Tareas</b> está lo de cada persona.",
    } },
    { element: '[data-tour="Encargos"]', popover: {
      title: "Encargos",
      description: "El recorrido de un evento: cargás el <b>cliente</b> (el centro y su contacto), registrás la <b>solicitud</b> y armás la <b>propuesta</b> con servicios y precios. Cuando la aceptan, el evento queda confirmado.",
    } },
    { element: '[data-tour="Catálogos"]', popover: {
      title: "Catálogos",
      description: "Tus servicios con precio, proveedores, salones y tipos de evento. Se cargan una vez y se usan en todos los eventos. Te dejamos algunos de ejemplo para arrancar.",
    } },
    { element: '[data-tour="Administración"]', popover: {
      title: "Tu equipo",
      description: "En <b>Usuarios</b> sumás a cada persona con su rol: atención al cliente, propuestas, organización o integrante. Cada uno ve lo que le toca.",
    } },
    { element: '[data-tour="aviso-prueba"]', popover: {
      title: "Prueba gratuita",
      description: "Tenés el sistema completo durante la prueba. Al terminar, tus datos quedan guardados y los podés seguir viendo.",
    } },
    { element: '[data-tour="menu-usuario"]', popover: {
      title: "Listo para empezar",
      description: (tieneRol("admin_empresa") ? "En <b>Pendientes</b> te dejamos una lista de <b>primeros pasos</b> para cargar tu primer evento. " : "")
        + "Si querés volver a ver este recorrido, está en este menú.",
    } },
  ];
};

const pasosSuperAdmin = () => [
  { popover: {
    title: "Administración del sistema",
    description: "Como super admin administrás las empresas que usan el sistema. No ves sus datos: cada empresa trabaja con los suyos.",
    showButtons: ["next", "close"],
  } },
  { element: '[data-tour="Administración"]', popover: {
    title: "Empresas",
    description: "Creás empresas y su primer administrador, las activás o desactivás y cambiás la fecha de fin de su prueba gratuita.",
  } },
  { element: '[data-tour="menu-usuario"]', popover: {
    title: "Listo",
    description: "Si querés volver a ver este recorrido, está en este menú.",
  } },
];

// Guarda en la base que ya lo vio (aunque lo haya salteado): no se vuelve a abrir solo.
const marcarVisto = () => api.patch("/me/recorrido", { recorrido_visto: true }).catch(() => {});

export function iniciarRecorrido({ usuario, tieneRol, esSuperAdmin }) {
  const pasos = (esSuperAdmin ? pasosSuperAdmin() : pasosEmpresa(usuario, tieneRol))
    .filter((paso) => !paso.element || visible(paso.element));

  const recorrido = driver({
    steps: pasos,
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    doneBtnText: "¡Empezar!",
    popoverClass: "recorrido",
    stagePadding: 6,
    stageRadius: 8,
    allowClose: true,
    onDestroyed: marcarVisto,
  });
  recorrido.drive();
}

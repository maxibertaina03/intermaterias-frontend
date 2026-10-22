# Changelog: front (intermaterias-frontend)

Todos los cambios importantes del front quedan registrados acá.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones siguen
[Versionado Semántico](https://semver.org/lang/es/). Las reglas del grupo están en
`intermaterias-infra/docs/versiones.md`.

## [Sin publicar]

### Agregado
- Página **Usuarios** para listar, crear y editar cuentas, roles y estado de acceso del equipo de la empresa (#32).
- Menú según quién entra: el super admin solo ve *Empresas*; los usuarios de una empresa ven sus datos, y *Usuarios* solo el administrador de la empresa.
- Nombre de la empresa en la barra superior; usuario y empresa en el menú de usuario.

### Cambiado
- **El menú lateral queda fijo** al bajar en las páginas largas.
- Las rutas de datos y las de empresas se separan por perfil: quien entra a una que no le corresponde vuelve a su inicio.

### Eliminado
- El registro público ("Creá tu cuenta"): los usuarios los crea el administrador de cada empresa.

## [1.0.0] - en preparación

Primera versión completa: todas las pantallas del recorrido de un evento, con login.

### Agregado
- **Login propio** (usuario y contraseña) con el diseño del sistema, sobre Clerk; menú de usuario y pantalla de "sin acceso".
- **Diseño con shadcn/ui** y Tailwind: menú lateral agrupado por áreas (Seguimiento, Encargos, Catálogos, Administración) y avisos con `sonner`.
- **Botones según el rol** del usuario (`SoloRol`).
- **Pendientes** (pantalla de inicio) y **Tareas** con filtros por estado y responsable.
- **Solicitudes y eventos**: listado con filtros, nueva solicitud, edición, cambio de estado, cierre y cancelación con motivo.
- **Detalle del evento** con pestañas: Propuesta (ítems, total, presentar, aceptar, rechazar), Servicios (proveedor o propio, responsable, confirmar), Tareas y Cambios.
- **Clientes** con sus contactos, y **Propuestas**.
- **Catálogos**: servicios, proveedores, sedes y tipos de evento.
- **Empresas** (CRUD).
- Versión del sistema visible al pie del menú.
- `Dockerfile` multi-stage (build con Node, servido con Nginx).

### Corregido
- En un evento realizado o cancelado ya no aparecen "Editar" ni "Cancelar evento" (tampoco "Cancelar" con la propuesta no aceptada) (#37).
- El formulario de solicitudes ya no muestra los contactos de otro cliente mientras carga los del elegido.

## [0.1.0] - 2026-10-15

### Agregado
- CRUD de empresas con navbar, página 404 y estilos generales.
- `Dockerfile` para correr el front en la infraestructura.

[Sin publicar]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v1.0.0...develop
[1.0.0]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/maxibertaina03/intermaterias-frontend/releases/tag/v0.1.0

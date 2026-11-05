# Changelog: front (intermaterias-frontend)

Todos los cambios importantes del front quedan registrados acá.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones siguen
[Versionado Semántico](https://semver.org/lang/es/). Las reglas del grupo están en
`intermaterias-infra/docs/versiones.md`.

## [Sin publicar]

### Agregado
- **Prueba gratuita de 30 días**: pantalla `/registro` donde una organizadora crea su empresa y su usuario, y entra directo al sistema. Enlace desde el login.
- Aviso de la prueba en la parte superior: días que quedan o, si venció, que la empresa está en solo lectura.
- Super admin: columna *Prueba gratuita* en Empresas y fecha de fin editable (vacía = sin límite).

### Cambiado
- **Menú lateral agrupado**: cada sección (Seguimiento, Encargos, Catálogos, Administración) se abre y se cierra al tocar su título, con animación; recuerda lo que dejaste cerrado.
- El CUIT de una empresa es obligatorio solo al crearla (las registradas en la prueba no lo tienen).

## [2.1.0] - 2026-11-05

El sistema tiene color: paleta índigo, coral y turquesa.

### Cambiado
- **El sistema tiene color**: índigo como color principal (barra superior, botones y enlaces), coral para las acciones destacadas (*Nueva solicitud*, *Presentar*) y fondo y texto en tonos pizarra.
- Los estados se ven con un color por tipo: pendiente en ámbar, confirmado en turquesa, en preparación en violeta, realizado o aceptado en verde, cancelado o rechazado en rojo.
- *Pendientes*: cada tarjeta con su franja e ícono de color.
- Login e invitación pública con fondo índigo.

## [2.0.1] - 2026-10-22

Sin cambios en el front: acompaña los arreglos de la API y la documentación de la v2.0.1.

## [2.0.0] - 2026-10-22

Cada empresa entra con sus propios usuarios y ve solo lo suyo, y los eventos tienen invitados con confirmación y pago.

### Agregado
- Alta del administrador inicial desde cada empresa para el super admin (#32).
- Página **Usuarios** para listar, crear y editar cuentas, roles y estado de acceso del equipo de la empresa (#32).
- Menú según quién entra: el super admin solo ve *Empresas*; los usuarios de una empresa ven sus datos, y *Usuarios* solo el administrador de la empresa.
- Nombre de la empresa en la barra superior; usuario y empresa en el menú de usuario.
- **Pantalla pública del invitado** (`/invitacion/:token`, sin iniciar sesión): datos del evento y formulario con nombre, apellido, si va, medio de pago y comprobante opcional (PDF, JPG o PNG hasta 5 MB) (#31).
- **Pestaña Invitados** en el detalle del evento: generar y copiar el link, precio y fecha límite, respuestas con totales, ver el comprobante y marcar el pago como verificado (#31).

### Cambiado
- **El menú lateral queda fijo** al bajar en las páginas largas.
- Las rutas de datos y las de empresas se separan por perfil: quien entra a una que no le corresponde vuelve a su inicio.

### Eliminado
- El registro público ("Creá tu cuenta"): los usuarios los crea el administrador de cada empresa.

## [1.0.1] - 2026-10-22

Sin cambios en el front: acompaña el arreglo de la API (en Docker las fechas se veían un día antes; ahora se ven bien).

## [1.0.0] - 2026-10-22

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

[Sin publicar]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v2.1.0...develop
[2.1.0]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/maxibertaina03/intermaterias-frontend/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/maxibertaina03/intermaterias-frontend/releases/tag/v0.1.0

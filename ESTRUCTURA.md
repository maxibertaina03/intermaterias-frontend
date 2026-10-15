# Estructura del frontend (guía para el grupo)

Todos trabajamos **igual**: React + Vite + **shadcn/ui** (componentes) + **Tailwind** (estilos) + axios + React Router.
El ejemplo de referencia es **`src/features/empresas/`**: antes de hacer una pantalla, mirá cómo está hecha esa.

## Carpetas

```
src/
├── main.jsx                  → monta la app (BrowserRouter + avisos)
├── App.jsx                   → TODAS las rutas (ya están registradas: no hace falta tocarlo)
├── index.css                 → tema de shadcn (no agregar estilos propios acá)
├── components/
│   ├── ui/                   → componentes de shadcn (no se editan; se agregan con el CLI)
│   ├── layout/AppLayout.jsx  → menú lateral + barra superior
│   └── common/               → piezas propias reutilizables (ver abajo)
├── features/                 → UNA CARPETA POR ÁREA: cada uno trabaja en la suya
│   ├── empresas/             → ejemplo de referencia
│   ├── clientes/             → Lucas
│   ├── eventos/              → Lucas (incluye el detalle del evento con pestañas)
│   ├── propuestas/           → Tomi
│   ├── tareas/               → Tomi (tareas + pendientes)
│   ├── catalogos/            → Facu (servicios, proveedores, sedes, tipos de evento)
│   └── coordinacion/         → Facu (servicios acordados de un evento)
├── lib/
│   ├── api.js                → instancia de axios (+ token del login)
│   ├── formato.js            → pesos, fechas y nombres de estados
│   └── utils.js              → helper de shadcn (cn)
└── pages/NoEncontrada.jsx
```

Dentro de cada `features/<area>/`:

| Archivo | Para qué |
|---------|----------|
| `<area>Service.js` | Una función por endpoint usando `api` de `@/lib/api`. Los componentes **nunca** escriben URLs |
| `<Algo>Page.jsx` | Página completa (la que va en una ruta) |
| `<Algo>Tab.jsx` | Pestaña dentro del detalle del evento |
| `<Algo>Form.jsx`, `<Algo>Dialog.jsx` | Componentes propios del área |

## Reglas para no pisarnos

1. **Cada uno toca solo su carpeta de `features/`.** Las rutas y el menú ya están; si necesitás una ruta nueva, avisá.
2. **El detalle del evento** (`features/eventos/EventoDetallePage.jsx`) muestra pestañas que viven en la carpeta de
   cada responsable: `PropuestaTab` (Tomi), `ServiciosAcordadosTab` (Facu), `TareasTab` (Tomi), `CambiosTab` (Lucas).
   Cada pestaña recibe `{ evento }` y se encarga de sus datos.
3. **`components/common/`** es compartido: si querés cambiar algo de ahí, avisá en el grupo.
4. Antes de empezar cada día: `git pull origin develop` (y `npm install` si alguien sumó librerías).

## Cómo hacer las cosas

### Importar
Siempre con el alias `@/` (apunta a `src/`):
```js
import { Button } from "@/components/ui/button";
import api, { mensajeDeError } from "@/lib/api";
```

### Agregar un componente de shadcn
Ya están: button, card, table, input, label, textarea, select, dialog, alert-dialog, badge, dropdown-menu,
tabs, sonner, separator, skeleton. Si necesitás otro (por ejemplo `checkbox`):
```bash
npx shadcn@latest add checkbox
```
Catálogo: https://ui.shadcn.com/docs/components (usar los ejemplos de la variante **Radix**).

### Estilos
**Clases de Tailwind** directamente en el JSX (`className="flex gap-2"`). Nada de CSS propio ni nombres de clases
inventados: así todo se ve igual. Colores siempre con los del tema (`text-muted-foreground`, `text-destructive`,
`bg-accent`), nunca colores fijos.

### Piezas comunes (usar SIEMPRE estas)

| Pieza | Uso |
|-------|-----|
| `PageHeader` | Título + descripción + botones de cada página |
| `Cargando`, `MensajeError`, `Vacio` (`common/Estados`) | La pantalla nunca queda en blanco |
| `Campo` | Label + input + error en formularios |
| `ConfirmDialog` | Confirmar antes de eliminar, cancelar, rechazar… |
| `EstadoBadge` | Mostrar cualquier estado (`recibida`, `presentada`, `pendiente`…) con el mismo estilo |
| `toast` de `sonner` | Avisos: `toast.success("Guardado")`, `toast.error(mensajeDeError(e))` |
| `formatearPesos`, `formatearFecha` (`@/lib/formato`) | Mostrar importes y fechas |

### Patrón de una página (resumen de `features/empresas/`)
1. Estados `datos`, `cargando`, `error`.
2. `useEffect` que llama al service y guarda `response.data`.
3. `if (cargando) <Cargando/>` · `if (error) <MensajeError/>` · lista vacía → `<Vacio/>`.
4. Tabla de shadcn dentro de una `Card`.
5. Acciones: primero la API, **después** actualizar el estado; avisar con `toast`.
6. Formularios: validar en el front (mismos obligatorios que la API), mandar los opcionales vacíos como `null`,
   mostrar el `mensaje` que devuelve la API.

### Nombres
- Componentes y páginas en **PascalCase** (`ClientesPage.jsx`), servicios en **camelCase** (`clientesService.js`).
- Usar los **términos acordados** del lenguaje ubicuo: solicitud, evento, propuesta, servicio acordado, contacto…
  (ver `intermaterias-infra/docs/si/03-dominio.md`).

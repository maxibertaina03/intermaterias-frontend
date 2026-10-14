# Intermaterias — Frontend

Frontend del sistema de eventos hecho con **React + Vite**. Consume la API de [intermaterias-backend](https://github.com/maxibertaina03/intermaterias-backend).

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` define la URL de la API y, de forma local, suele ser `http://localhost:3000/api`. También puedes generar el build de producción con `npm run build`; Vite lo deja en `dist/`.

## Construir y ejecutar con Docker

La imagen compila React durante la etapa de build y sirve los archivos estáticos con nginx.

```bash
docker build -t intermaterias-front .
docker run --rm -p 8080:80 intermaterias-front
```

Abre <http://localhost:8080> y <http://localhost:8080/empresas/nueva>. La segunda ruta también carga directamente gracias al fallback de nginx a `index.html`.

El build usa `VITE_API_URL=/api` por defecto para que las llamadas de la aplicación usen la ruta del balanceador. Para cambiarla al construir la imagen:

```bash
docker build --build-arg VITE_API_URL=/api -t intermaterias-front .
```

Vite incorpora esta variable en los archivos estáticos durante el build; no se puede cambiar al iniciar el contenedor.

## Trabajo en grupo

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de ramas (`masita` / `facu` / `tomi` / `lucas` → `develop` → `main`).

### Agregar integrantes al repo (lo hace el dueño)

```bash
gh api -X PUT repos/maxibertaina03/intermaterias-frontend/collaborators/USUARIO_GITHUB -f permission=push
```

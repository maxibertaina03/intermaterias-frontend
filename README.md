# Intermaterias — Frontend

Frontend del sistema de eventos hecho con **React + Vite**.
Consume la API de [intermaterias-backend](https://github.com/maxibertaina03/intermaterias-backend).

## Instalación

```bash
git clone https://github.com/maxibertaina03/intermaterias-frontend.git
cd intermaterias-frontend
npm install
cp .env.example .env
```

`VITE_API_URL` apunta a la API (por defecto `http://localhost:3000/api`). En el código se usa así:

```js
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/empresas`);
```

## Ejecutar

```bash
npm run dev       # http://localhost:5173
npm run build     # build de producción en dist/
```

Para que funcione con datos, el backend tiene que estar corriendo (`npm run dev` en intermaterias-backend).

## Trabajo en grupo

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de ramas (`masita` / `facu` / `tomi` / `lucas` → `develop` → `main`).

### Agregar integrantes al repo (lo hace el dueño)

```bash
gh api -X PUT repos/maxibertaina03/intermaterias-frontend/collaborators/USUARIO_GITHUB -f permission=push
```

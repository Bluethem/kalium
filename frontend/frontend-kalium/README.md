# Kalium Frontend

Cliente web de Kalium construido con React y Vite.

## Requisitos

- Node.js 20+
- pnpm (`corepack enable`)

## Desarrollo

Desde este directorio:

```bash
pnpm install
pnpm dev
```

La aplicación estará disponible en http://localhost:5173 y usará
`http://localhost:8080/api` como API por defecto. Para apuntar a otra API,
define `VITE_API_URL` antes de iniciar Vite.

## Build de producción

```bash
pnpm build
```

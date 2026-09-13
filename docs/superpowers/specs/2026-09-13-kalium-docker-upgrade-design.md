# Kalium — Docker Compose + upgrade agresivo

Fecha: 2026-09-13  
Estado: aprobado por el usuario (diseño conversacional)

## Objetivo

Modernizar el entorno de desarrollo de Kalium: reemplazar XAMPP por Docker Compose (MySQL + backend), actualizar paquetes con salto de majors cuando aplique, migrar el frontend de npm a pnpm, y cargar automáticamente schema + datos de prueba.

## Decisiones acordadas

| Tema | Decisión |
|------|----------|
| Compose | MySQL + backend en Docker; frontend en host con Vite |
| Seed | Schema (`base_datos_kalium.sql`) + datos de prueba (`datos_prueba_actualizado.sql`) |
| Upgrade | Agresivo (majors): Spring Boot 4.1.x, Java 21, frontend a últimas estables |
| Credenciales MySQL | Defaults de desarrollo vía `.env.example`: user/pass/db `kalium` / `kalium` / `kaliumdb` |
| Package manager FE | **pnpm** (reemplaza npm / `package-lock.json`) |

## Arquitectura local

```
docker compose up
  ├── mysql:3306
  │     ├── MYSQL_DATABASE=kaliumdb
  │     ├── init: schema + datos de prueba (solo en volumen vacío)
  │     └── healthcheck
  └── backend:8080
        ├── build multi-stage (Maven → JAR)
        ├── espera MySQL healthy
        └── datasource desde variables de entorno

pnpm (host)
  └── frontend/frontend-kalium → Vite :5173 → API http://localhost:8080
```

### Flujo de datos

1. Al primer `docker compose up`, MySQL ejecuta scripts de init en orden.
2. El backend arranca cuando MySQL está healthy y usa JDBC hacia el servicio `mysql`.
3. El frontend en el host llama a `localhost:8080` (puerto publicado del backend).
4. Gemini sigue opcional vía `GEMINI_API_KEY` / `GOOGLE_AI_API_KEY` en el entorno del backend.

## Componentes a entregar

### 1. Docker

- `docker-compose.yml` en la raíz del repo
- `backend/Dockerfile` multi-stage (JDK 21 + Maven build → JRE runtime)
- Healthcheck MySQL; `depends_on` con condición `service_healthy` para el backend
- Volumen nombrado para persistencia de MySQL
- Red interna Compose; puertos publicados: `3306`, `8080`

### 2. Base de datos / init

- Adaptar scripts SQL para init de Docker oficial MySQL:
  - Evitar `CREATE DATABASE` conflictivo cuando `MYSQL_DATABASE` ya crea `kaliumdb`
  - Mantener `USE kaliumdb` o confiar en la DB por defecto del entrypoint
  - Orden: primero schema, luego datos de prueba (p. ej. `01-*.sql`, `02-*.sql` montados en `/docker-entrypoint-initdb.d`)
- Conservar los SQL originales en `database/` como fuente; usar copias/adaptaciones para Docker si hace falta
- `ddl-auto` permanece en `none` (schema viene de SQL, no de Hibernate)

### 3. Configuración backend

- Externalizar datasource a env (`SPRING_DATASOURCE_URL`, username, password)
- Defaults alineados con Compose (host `mysql` dentro de la red Docker)
- Eliminar `spring.config.import` duplicado en `application.properties`
- Actualizar dialecto JPA / plataforma MySQL a la forma recomendada por Spring Boot 4 / Hibernate actual (quitar `MySQL8Dialect` deprecado)
- Bump: `pom.xml` → Java 21, Spring Boot parent **4.1.x** (estable más reciente de la línea 4.1), Lombok compatible
- Eliminar código muerto Node en `backend/controllers/` y `backend/services/` (Gemini ya existe en Java)

### 4. Frontend

- Migrar a pnpm: `pnpm-lock.yaml`, eliminar `package-lock.json` del frontend (y el lock huérfano en `frontend/` si aplica)
- Actualizar dependencias a últimas versiones estables (incluyendo majors cuando sea viable)
- Centralizar URL de API/WebSocket con `VITE_API_URL` (default `http://localhost:8080`)
- Sustituir fetches hardcodeados a `localhost:8080` por la base configurable
- Scripts documentados: `pnpm install`, `pnpm dev`, `pnpm build`

### 5. Entorno y docs

- `.env.example` en la raíz con variables MySQL, Spring datasource y Gemini opcional
- `.env` en `.gitignore` (no commitear secretos)
- README: quitar XAMPP; documentar `docker compose up`, pnpm, Java 21, credenciales default

## Fuera de alcance

- Contenerizar el frontend
- CI/CD, deploy a producción
- Endurecer Spring Security / JWT / auth real
- Migrar a PostgreSQL u otro motor
- Refactors de dominio / features nuevas de laboratorio

## Criterios de éxito

1. `docker compose up --build` levanta MySQL + backend sin XAMPP.
2. Tras el primer arranque, la BD tiene schema y datos de prueba.
3. `pnpm install && pnpm dev` en el frontend conecta a la API en `:8080`.
4. Backend compila y arranca con Spring Boot 4.1.x / Java 21.
5. README refleja el flujo nuevo; no se requieren pasos de phpMyAdmin/XAMPP.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Breaking changes Spring Boot 3 → 4 | Seguir migration guide oficial; arreglar compile errors de Security/Jackson/Hibernate |
| Init SQL falla en Docker | Adaptar scripts; probar con volumen limpio (`docker compose down -v`) |
| Seed no se re-ejecuta con volumen existente | Documentar que init solo corre en DB nueva; `-v` para reset |
| Frontend rompe con majors | Actualizar por grupos; verificar build Vite y rutas críticas (login, API) |
| Gemini sin API key | Backend debe arrancar igual; fallar solo al invocar el chat |

## Verificación manual

1. Copiar `.env.example` → `.env`
2. `docker compose up --build`
3. Comprobar health: MySQL healthy + un GET de API existente en `http://localhost:8080` (sin añadir Actuator)
4. Confirmar filas de prueba en MySQL (p. ej. roles/usuarios)
5. `cd frontend/frontend-kalium && pnpm install && pnpm dev`
6. Login / dashboard contra API local

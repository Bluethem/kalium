# Kalium Docker + Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar Kalium con Docker Compose (MySQL + backend), seed de schema + datos de prueba, upgrade agresivo a Spring Boot 4.1.1 / Java 21, y frontend con pnpm + `VITE_API_URL`.

**Architecture:** Compose clásico: servicio `mysql` (init scripts en `/docker-entrypoint-initdb.d`) y servicio `backend` (Dockerfile multi-stage Maven→JAR). El frontend corre en el host con Vite/pnpm y apunta a `http://localhost:8080`. Credenciales default `kalium`/`kalium`/`kaliumdb` vía `.env`.

**Tech Stack:** Java 21, Spring Boot 4.1.1, MySQL 8, Docker Compose, React + Vite, pnpm

**Spec:** `docs/superpowers/specs/2026-09-13-kalium-docker-upgrade-design.md`

## Global Constraints

- Compose: MySQL + backend only; frontend stays on host with Vite
- Seed: `base_datos_kalium.sql` + `datos_prueba_actualizado.sql` on first volume init
- Backend target: Spring Boot **4.1.1**, Java **21**
- MySQL defaults: user `kalium`, password `kalium`, database `kaliumdb`
- Frontend package manager: **pnpm** (no npm lockfiles)
- `spring.jpa.hibernate.ddl-auto=none` (schema from SQL only)
- Do not containerize frontend; no JWT/Security hardening; no CI/CD in this plan
- Never commit `.env` with secrets; ship `.env.example` only
- Commit author: if `git commit` fails on missing identity, use env `GIT_AUTHOR_*` / `GIT_COMMITTER_*` from last commit — do not run `git config`

## File map

| File | Responsibility |
|------|----------------|
| `.env.example` | Documented defaults for Compose + Gemini optional |
| `.gitignore` | Ignore `.env`, expand ignores as needed |
| `docker-compose.yml` | `mysql` + `backend` services, volumes, healthchecks |
| `backend/Dockerfile` | Multi-stage build JDK 21 → runtime JAR |
| `backend/.dockerignore` | Speed/safer Docker context |
| `database/docker/01-schema.sql` | Schema adapted for MySQL Docker init |
| `database/docker/02-seed.sql` | Seed adapted for MySQL Docker init |
| `backend/pom.xml` | Spring Boot 4.1.1 + Java 21 |
| `backend/src/main/resources/application.properties` | Env-driven datasource; clean duplicates |
| `frontend/frontend-kalium/src/config.js` | `VITE_API_URL` base (API + WS) |
| `frontend/frontend-kalium/src/services/api.js` | Use config base URL |
| `frontend/frontend-kalium/src/services/websocket.js` | Use config WS URL |
| Pages with hardcoded `localhost:8080` | Switch to config / `api` helpers |
| `frontend/frontend-kalium/package.json` + `pnpm-lock.yaml` | pnpm + dependency bumps |
| `README.md` | New local workflow (Compose + pnpm) |

Delete: `backend/controllers/chatController.js`, `backend/services/geminiService.js`, `frontend/frontend-kalium/package-lock.json`, `frontend/package-lock.json`

---

### Task 1: Env template and gitignore

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`
- Test: `test -f .env.example && grep -q '^\.env$' .gitignore`

**Interfaces:**
- Consumes: none
- Produces: env var names used by Compose and Spring:
  - `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
  - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
  - `GEMINI_API_KEY` (optional), `GEMINI_MODEL` (optional)

- [ ] **Step 1: Write `.env.example`**

```env
# MySQL (Docker)
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=kaliumdb
MYSQL_USER=kalium
MYSQL_PASSWORD=kalium

# Backend → MySQL (hostname `mysql` is the Compose service name)
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/kaliumdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=kalium
SPRING_DATASOURCE_PASSWORD=kalium

# Optional Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

- [ ] **Step 2: Update `.gitignore`**

Replace contents (keep existing ignore, add env/docker noise):

```gitignore
/backend/nbproject/
.env
*.log
.DS_Store
```

- [ ] **Step 3: Verify**

Run:

```bash
test -f .env.example && grep -q '^\.env$' .gitignore && echo OK
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "$(cat <<'EOF'
Add env example and ignore local .env for Compose.

EOF
)"
```

---

### Task 2: Docker-ready SQL init scripts

**Files:**
- Create: `database/docker/01-schema.sql`
- Create: `database/docker/02-seed.sql`
- Keep originals: `database/base_datos_kalium.sql`, `database/datos_prueba_actualizado.sql` (source of truth for humans)
- Test: file presence + no bare `CREATE DATABASE` in docker scripts

**Interfaces:**
- Consumes: content of `database/base_datos_kalium.sql` and `database/datos_prueba_actualizado.sql`
- Produces: scripts mounted at `/docker-entrypoint-initdb.d` that run against `MYSQL_DATABASE=kaliumdb`

- [ ] **Step 1: Create schema init without CREATE DATABASE**

```bash
mkdir -p database/docker
# Copy schema and strip CREATE DATABASE / USE lines that conflict with Docker entrypoint
sed '/^CREATE DATABASE/d; /^USE kaliumdb/d' database/base_datos_kalium.sql > database/docker/01-schema.sql
```

Add this header at the top of `database/docker/01-schema.sql` (after the existing comment block is fine):

```sql
-- Docker init: runs inside MYSQL_DATABASE=kaliumdb (no CREATE DATABASE)
```

- [ ] **Step 2: Create seed init without USE**

```bash
sed '/^USE kaliumdb/d' database/datos_prueba_actualizado.sql > database/docker/02-seed.sql
```

Add header:

```sql
-- Docker init seed: datos de prueba (runs after 01-schema.sql)
```

- [ ] **Step 3: Verify adaptations**

Run:

```bash
! grep -E '^CREATE DATABASE' database/docker/01-schema.sql
! grep -E '^USE ' database/docker/*.sql
wc -l database/docker/01-schema.sql database/docker/02-seed.sql
```

Expected: no matches from greps; line counts roughly match originals (~315 and ~441 minus a few lines).

- [ ] **Step 4: Commit**

```bash
git add database/docker/
git commit -m "$(cat <<'EOF'
Add MySQL Docker init scripts for schema and seed data.

EOF
)"
```

---

### Task 3: Dockerfile and Compose (MySQL + backend)

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`
- Create: `docker-compose.yml`
- Test: `docker compose config` validates; later full up in Task 7

**Interfaces:**
- Consumes: env names from Task 1; init scripts from Task 2
- Produces: services `mysql` (port 3306) and `backend` (port 8080); volume `mysql_data`

- [ ] **Step 1: Write `backend/.dockerignore`**

```dockerignore
target/
.mvn/wrapper/maven-wrapper.jar
nbactions.xml
nb-configuration.xml
controllers/
services/
*.md
.git
```

- [ ] **Step 2: Write `backend/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY src ./src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Note: if `mvnw` is awkward in Docker on Windows/WSL line endings, fall back to `mvn` from the Maven image:

```dockerfile
RUN mvn -q -DskipTests dependency:go-offline
...
RUN mvn -q -DskipTests package
```

Prefer `mvn` from the image for reliability; keep `pom.xml` + `src` copy pattern.

Preferred final Dockerfile (use this):

```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- [ ] **Step 3: Write `docker-compose.yml`**

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: kalium-mysql
    restart: unless-stopped
    env_file: .env
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/docker:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-u${MYSQL_USER}", "-p${MYSQL_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 20s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kalium-backend
    restart: unless-stopped
    env_file: .env
    environment:
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
      GEMINI_MODEL: ${GEMINI_MODEL:-gemini-2.5-flash}
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy

volumes:
  mysql_data:
```

- [ ] **Step 4: Local `.env` for validation (do not commit)**

```bash
cp .env.example .env
docker compose config >/dev/null && echo COMPOSE_OK
```

Expected: `COMPOSE_OK`

- [ ] **Step 5: Commit**

```bash
git add backend/Dockerfile backend/.dockerignore docker-compose.yml
git commit -m "$(cat <<'EOF'
Add Docker Compose stack for MySQL and Spring backend.

EOF
)"
```

---

### Task 4: Backend config for env + Spring Boot 4.1.1 / Java 21

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.properties`
- Delete: `backend/controllers/chatController.js`
- Delete: `backend/services/geminiService.js`
- Test: `./mvnw -q -DskipTests package` (or `mvn`) inside `backend/`

**Interfaces:**
- Consumes: env vars from Task 1
- Produces: runnable JAR compatible with Compose datasource URL host `mysql`

- [ ] **Step 1: Update `backend/pom.xml` parent and Java**

Change parent version to `4.1.1` and Java to `21`:

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.1</version>
  <relativePath/>
</parent>
```

```xml
<properties>
  <java.version>21</java.version>
</properties>
```

Remove unused Google Cloud BOM `dependencyManagement` block entirely (no Google Cloud Maven deps are used).

Update Lombok to a version compatible with Java 21 / Boot 4 (let Boot manage it if possible): remove explicit Lombok `<version>` on dependency and in `annotationProcessorPaths` use `${lombok.version}` or omit version when inherited — if compile fails, pin latest stable Lombok (e.g. `1.18.38+`).

Update `maven-compiler-plugin` source/target (or `release`) to `21`.

- [ ] **Step 2: Rewrite `application.properties`**

```properties
spring.application.name=kalium
server.port=8080

spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/kaliumdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:kalium}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:kalium}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl

spring.config.import=optional:classpath:application-secret.properties

logging.level.root=WARN
logging.level.com.laboQuimica.kalium=DEBUG
logging.level.com.laboQuimica.kalium.service.NotificacionWebSocketService=DEBUG
```

Do **not** set deprecated `MySQL8Dialect`. Do **not** duplicate `spring.config.import`.

- [ ] **Step 3: Delete dead Node Gemini stubs**

```bash
rm -f backend/controllers/chatController.js backend/services/geminiService.js
rmdir backend/controllers backend/services 2>/dev/null || true
```

- [ ] **Step 4: Fix compile breakages from Boot 4 migration**

Run:

```bash
cd backend && mvn -q -DskipTests package
```

Expected: `BUILD SUCCESS`.

If Security/Jackson/Hibernate APIs break, apply minimal fixes per [Spring Boot 4.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide):
- Keep `SecurityFilterChain` permit-all as today unless APIs renamed
- Prefer Boot auto-config for MySQL dialect
- Do not expand Security scope

- [ ] **Step 5: Commit**

```bash
git add backend/pom.xml backend/src/main/resources/application.properties
git add -u backend/controllers backend/services
git commit -m "$(cat <<'EOF'
Upgrade backend to Spring Boot 4.1.1 and Java 21.

EOF
)"
```

---

### Task 5: Frontend API config (`VITE_API_URL`)

**Files:**
- Create: `frontend/frontend-kalium/src/config.js`
- Modify: `frontend/frontend-kalium/src/services/api.js`
- Modify: `frontend/frontend-kalium/src/services/websocket.js`
- Modify every file under `frontend/frontend-kalium/src` that hardcodes `http://localhost:8080` (grep count was 11 files including services)
- Test: `rg 'localhost:8080' frontend/frontend-kalium/src` returns no matches

**Interfaces:**
- Consumes: `import.meta.env.VITE_API_URL` (default `http://localhost:8080`)
- Produces:
  - `API_BASE_URL` → `${origin}/api`
  - `WS_URL` → `${origin}/ws`
  - export `getApiOrigin()` helper if needed by pages using raw `fetch`

- [ ] **Step 1: Create `src/config.js`**

```js
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const API_ORIGIN_URL = API_ORIGIN;
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const WS_URL = `${API_ORIGIN}/ws`;
```

- [ ] **Step 2: Wire `api.js` and `websocket.js`**

In `api.js`, replace hardcoded base:

```js
import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
```

In `websocket.js`:

```js
import { WS_URL } from '../config';
// ...
const socket = new SockJS(WS_URL);
```

- [ ] **Step 3: Replace raw fetch URLs in pages**

For each file matching `localhost:8080`, import `API_BASE_URL` or `API_ORIGIN_URL` and substitute:

```js
import { API_BASE_URL } from '../config'; // adjust relative path per file
// e.g. fetch(`${API_BASE_URL}/usuarios`)
```

Files to update (verify with grep):

- `src/pages/Usuarios.jsx`
- `src/pages/Solicitudes.jsx`
- `src/pages/Pedidos/NuevoPedido.jsx`
- `src/pages/Register.jsx`
- `src/pages/Login.jsx`
- `src/pages/Insumos/DetalleInsumo.jsx`
- `src/pages/DashboardAdminSistema.jsx`
- `src/pages/Cuenta.jsx`
- `src/components/Chat/ChatWidget.jsx`

Prefer migrating call sites to existing `*Service` helpers in `api.js` when a method already exists; otherwise use `API_BASE_URL`.

- [ ] **Step 4: Verify no hardcoded host**

```bash
rg 'localhost:8080' frontend/frontend-kalium/src || echo CLEAN
```

Expected: `CLEAN`

- [ ] **Step 5: Commit**

```bash
git add frontend/frontend-kalium/src
git commit -m "$(cat <<'EOF'
Centralize frontend API and WebSocket base URL via VITE_API_URL.

EOF
)"
```

---

### Task 6: Migrate to pnpm and bump frontend deps

**Files:**
- Modify: `frontend/frontend-kalium/package.json`
- Create: `frontend/frontend-kalium/pnpm-lock.yaml`
- Delete: `frontend/frontend-kalium/package-lock.json`
- Delete: `frontend/package-lock.json` (orphan at `frontend/`)
- Optional: `frontend/frontend-kalium/.npmrc` with `shamefully-hoist=false` (default OK)
- Test: `pnpm install` + `pnpm build`

**Interfaces:**
- Consumes: Task 5 config module
- Produces: lockfile for reproducible installs; scripts remain `dev` / `build` / `lint` / `preview`

- [ ] **Step 1: Ensure pnpm available**

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

Expected: prints a pnpm version (9+ or 10+).

- [ ] **Step 2: Remove npm lockfiles and install with pnpm**

```bash
rm -f frontend/frontend-kalium/package-lock.json frontend/package-lock.json
cd frontend/frontend-kalium
pnpm install
```

- [ ] **Step 3: Aggressive dependency update**

```bash
cd frontend/frontend-kalium
pnpm update --latest
# If interactive tools needed, use:
# pnpm outdated
# then bump majors in package.json and pnpm install
```

Resolve Tailwind v3 config vs `@tailwindcss/postcss` v4 mismatch: pick **one** stack (prefer Tailwind v4 OR stay on v3 consistently). If staying on v3, remove `@tailwindcss/postcss` from `package.json`. If moving to v4, update `postcss.config.js` / CSS entry per Tailwind v4 docs and remove `tailwind.config.js` only if migration requires it.

- [ ] **Step 4: Build**

```bash
cd frontend/frontend-kalium
pnpm build
```

Expected: Vite build succeeds (`dist/` created).

- [ ] **Step 5: Commit**

```bash
git add frontend/frontend-kalium/package.json frontend/frontend-kalium/pnpm-lock.yaml
git add -u frontend/frontend-kalium/package-lock.json frontend/package-lock.json
git add frontend/frontend-kalium/postcss.config.js frontend/frontend-kalium/tailwind.config.js frontend/frontend-kalium/src/index.css 2>/dev/null || true
git commit -m "$(cat <<'EOF'
Switch frontend to pnpm and update dependencies.

EOF
)"
```

---

### Task 7: README + end-to-end verification

**Files:**
- Modify: `README.md`
- Modify: `frontend/frontend-kalium/README.md` (pnpm commands)
- Test: full Compose up + health + seed + frontend build already done

**Interfaces:**
- Consumes: all previous tasks
- Produces: documented happy path matching success criteria in the spec

- [ ] **Step 1: Rewrite root README install section**

Replace XAMPP/npm instructions with:

```markdown
## Requisitos
- Docker + Docker Compose
- Java 21 (solo si corres el backend fuera de Docker)
- Node.js 20+ con pnpm (`corepack enable`)

## Levantamiento
1. `cp .env.example .env`
2. `docker compose up --build`
3. Backend: http://localhost:8080/api/health
4. Frontend:
   ```bash
   cd frontend/frontend-kalium
   pnpm install
   pnpm dev
   ```
5. App: http://localhost:5173

Credenciales MySQL default: user `kalium`, password `kalium`, database `kaliumdb`.

Para resetear BD y volver a cargar seed: `docker compose down -v && docker compose up --build`
```

Keep project description/authors; remove XAMPP badge/requirements.

- [ ] **Step 2: Bring stack up clean**

```bash
cp -n .env.example .env
docker compose down -v
docker compose up --build -d
```

Wait until healthy, then:

```bash
curl -s http://localhost:8080/api/health
docker compose exec mysql mysql -ukalium -pkalium kaliumdb -e "SELECT COUNT(*) AS roles FROM Rol; SELECT COUNT(*) AS usuarios FROM Usuario;"
```

Expected: JSON with `"status":"OK"`; `roles` and `usuarios` counts > 0.

- [ ] **Step 3: Frontend smoke**

```bash
cd frontend/frontend-kalium && pnpm install && pnpm build
```

Expected: build OK. Optionally `pnpm dev` and login against seeded users from `datos_prueba_actualizado.sql`.

- [ ] **Step 4: Commit docs**

```bash
git add README.md frontend/frontend-kalium/README.md
git commit -m "$(cat <<'EOF'
Document Docker Compose and pnpm local workflow.

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Compose MySQL + backend | Task 3 |
| Frontend on host + Vite | Tasks 5–7 |
| Seed schema + datos prueba | Task 2 (+ Task 3 mount) |
| Spring Boot 4.1.x + Java 21 | Task 4 |
| Credenciales kalium/kalium | Tasks 1, 3 |
| pnpm | Task 6 |
| `.env.example`, no commit `.env` | Task 1 |
| Externalizar datasource | Task 4 |
| Quitar JS Gemini muerto | Task 4 |
| Quitar dialecto/import duplicado | Task 4 |
| `VITE_API_URL` | Task 5 |
| README sin XAMPP | Task 7 |
| Criterios de éxito / verificación | Task 7 |

No placeholders left. Types/env names consistent: `SPRING_DATASOURCE_*`, `MYSQL_*`, `VITE_API_URL`, `API_BASE_URL`, `WS_URL`.
)

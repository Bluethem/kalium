# Proyecto Kalium
> Plataforma para la gestión de laboratorios de química

<p align="center">
  <img src="https://img.shields.io/badge/Status-Finalizado-blueviolet?style=flat-square">
  <img src="https://img.shields.io/badge/Licencia-MIT-green?style=flat-square">
  <img src="https://img.shields.io/badge/Framework-React-red?style=flat-square">
  <img src="https://img.shields.io/badge/Backend-Java-orange?style=flat-square">
</p>

<div align="center">
  <img src="/frontend/frontend-kalium/public/logo_nuevo.png" alt="Blume Cover" style="border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.15);">
</div>

## Descripción general

Aplicación web full-stack construida con Spring Boot (Java) para el backend y React + Vite + TailwindCSS para el frontend. El sistema está diseñado para ser modular, escalable y fácil de desplegar.

## Estructura del Proyecto

```
kalium/
├── backend/ # API REST en Spring Boot
│ ├── src/ # Código fuente (Java)
│ └── pom.xml # Dependencias Maven
│
├── frontend/ # Aplicación cliente en React + Vite
│ ├── src/ # Componentes React
│ ├── public/ # Archivos estáticos
│ └── package.json # Dependencias pnpm
│
└── database/ # Scripts SQL para MySQL/PostgreSQL
```

## Requisitos

- Docker + Docker Compose
- Java 21 (solo si ejecutas el backend fuera de Docker)
- Node.js 20+ con pnpm (`corepack enable`)

## Levantamiento

1. Crea la configuración local:

   ```bash
   cp .env.example .env
   ```

2. Levanta MySQL y el backend:

   ```bash
   docker compose up --build
   ```

3. Comprueba el backend en http://localhost:8080/api/health.

4. En otra terminal, levanta el frontend:

   ```bash
   cd frontend/frontend-kalium
   pnpm install
   pnpm dev
   ```

5. Abre la aplicación en http://localhost:5173.

Las credenciales MySQL predeterminadas son: usuario `kalium`, contraseña `kalium` y base de datos `kaliumdb`.

Para resetear la base de datos y volver a cargar el seed:

```bash
docker compose down -v && docker compose up --build
```

## Funcionalidades
- Autenticación de usuarios
- Gestión de perfiles y roles
- Dashboard dinámico con React + TailwindCSS
- API REST escalable con Spring Boot
- Persistencia en base de datos relacional
- Interfaz moderna y responsiva

## Tecnologías
- Backend:
    - Java 21
    - Spring Boot 4 (Spring Web, Spring Data JPA, Spring Security)
    - Maven
- Frontend:
    - React 18
    - Vite
    - TailwindCSS
- Base de Datos:
    - MySQL

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,java,spring,mysql,git&theme=dark" />
</div>

### Autores
- **Desarrollado por:**
    **1. David Luza Ccorimanya**
    **2. Henry Javier Medina Malpartida**
    **3. Romel Rodrigo Chumpitaz Flores**

- **Contactos:** 
    1. david.luza.c@uni.pe
    2. henry.medina.m@uni.pe
    3. romel.chumpitaz.f@uni.pe
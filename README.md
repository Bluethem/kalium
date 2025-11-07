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
│ └── package.json # Dependencias npm
│
└── database/ # Scripts SQL para MySQL/PostgreSQL
```

## Requisitos

- **Java 17+** - Usar java v17, por temas de compatibilidad con lombok.
- **Maven 3+** - Si clonas el repositorio, te recomiendo usar netbeans v24 (configurando la version de java) o en su defecto usar la dependencia de maven para ejecutar directamente desde consola.
- **Node.js 18+** - Instalar dependencias de node.js.
- **MySQL** - Proyecto corrido desde una dependencia de mariaDB (XAMPP).

<p align="center">
  <img src="https://img.shields.io/badge/Java-17%2B-007396?logo=openjdk&logoColor=white&style=for-the-badge" alt="Java 17+">
  <img src="https://img.shields.io/badge/Maven-3%2B-C71A36?logo=apachemaven&logoColor=white&style=for-the-badge" alt="Maven 3+">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white&style=for-the-badge" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=white&style=for-the-badge" alt="React 18+">
  <img src="https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql&logoColor=white&style=for-the-badge" alt="MySQL 8+">
  <img src="https://img.shields.io/badge/XAMPP-8%2B-FB7A24?logo=xampp&logoColor=white&style=for-the-badge" alt="XAMPP 8+">
</p>

## Instalación y Ejecución

### 1. Backend (Spring Boot)

1. Ir al directorio `backend/`
2. Configurar la base de datos en `application.properties` o `application.yml`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/kaliumdb
spring.datasource.username=root
spring.datasource.password=tu_clave
spring.jpa.hibernate.ddl-auto=update
```

3. Ejecutar con Maven:
```
mvn spring-boot:run
```

El backend correrá en: http://localhost:8080

### 2. Frontend (React + Vite + Tailwind)

Ir al directorio frontend/

Instalar dependencias:

```
npm install
```

Iniciar el servidor de desarrollo:

```
npm run dev
```

El frontend correrá en: http://localhost:5173

### 3. Conexión Frontend ↔ Backend

El frontend consume la API del backend desde http://localhost:8080/api/.... Configura la URL base en frontend/src/config.js (o donde la tengas definida).

## Funcionalidades
- Autenticación de usuarios
- Gestión de perfiles y roles
- Dashboard dinámico con React + TailwindCSS
- API REST escalable con Spring Boot
- Persistencia en base de datos relacional
- Interfaz moderna y responsiva

## Tecnologías
- Backend:
    - Java 17
    - Spring Boot 3 (Spring Web, Spring Data JPA, Spring Security)
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
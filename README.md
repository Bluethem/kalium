# Proyecto Kalium

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

- **Java 17+**
- **Maven 3+**
- **Node.js 18+**
- **MySQL / PostgreSQL**

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

### 4. Funcionalidades
- Autenticación de usuarios
- Gestión de perfiles y roles
- Dashboard dinámico con React + TailwindCSS
- API REST escalable con Spring Boot
- Persistencia en base de datos relacional
- Interfaz moderna y responsiva

### 5. Tecnologías
- Backend:
    - Java 17
    - Spring Boot 3 (Spring Web, Spring Data JPA, Spring Security)
    - Maven
- Frontend:
    - React 18
    - Vite
    - TailwindCSS
- Base de Datos:
    - MySQL / PostgreSQL

### 6. Autor
- Desarrollado por:
    1. David Luza Ccorimanya
    2. Henry Javier Medina Malpartida
    3. Romel Rodrigo Chumpitaz Flores

- Contactos: 
    1. david.luza.c@uni.pe
    2. henry.medina.m@uni.pe
    3. romel.chumpitaz.f@uni.pe
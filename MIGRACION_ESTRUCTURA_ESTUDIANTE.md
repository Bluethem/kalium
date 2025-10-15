# 🔄 Migración: Estudiante con Usuario

## ⚠️ **CAMBIO ESTRUCTURAL IMPORTANTE**

Se modificó la estructura de la tabla `Estudiante` para que siga el patrón de `Administrador` e `Instructor`, relacionándola con `Usuario`.

---

## 📊 **Cambios Realizados:**

### **1. Base de Datos:**

#### **Antes:**
```sql
CREATE TABLE Estudiante
(
  IDEstudiante INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstudiante)
);
```

#### **Después:**
```sql
CREATE TABLE Estudiante
(
  IDEstudiante INT NOT NULL AUTO_INCREMENT,
  IDUsuario INT NOT NULL UNIQUE,
  PRIMARY KEY (IDEstudiante),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);
```

**Ventajas:**
- ✅ Estudiantes ahora son usuarios del sistema
- ✅ Pueden iniciar sesión
- ✅ Tienen roles asignados
- ✅ Nombre y apellido se obtienen de `Usuario`
- ✅ Consistencia con Administrador e Instructor

---

### **2. Tabla Curso Mejorada:**

Se agregaron campos a `Curso`:

```sql
CREATE TABLE Curso
(
  IDCurso INT NOT NULL AUTO_INCREMENT,
  NombreCurso VARCHAR(100) NOT NULL,
  Codigo VARCHAR(20) NOT NULL UNIQUE,      -- ✅ NUEVO
  Descripcion VARCHAR(255),                 -- ✅ NUEVO
  PRIMARY KEY (IDCurso)
);
```

---

## 🔧 **Script de Migración:**

### **Paso 1: Respaldar Datos Existentes**

```sql
-- Crear tabla temporal con los estudiantes actuales
CREATE TABLE Estudiante_Backup AS SELECT * FROM Estudiante;
```

### **Paso 2: Eliminar Tabla Antigua**

```sql
-- Eliminar foreign keys que referencian a Estudiante
ALTER TABLE Entrega DROP FOREIGN KEY Entrega_ibfk_2;
ALTER TABLE Incidentes DROP FOREIGN KEY Incidentes_ibfk_1;

-- Eliminar tabla actual
DROP TABLE IF EXISTS Estudiante;
```

### **Paso 3: Crear Nueva Estructura**

```sql
-- Crear tabla Estudiante con nueva estructura
CREATE TABLE Estudiante
(
  IDEstudiante INT NOT NULL AUTO_INCREMENT,
  IDUsuario INT NOT NULL UNIQUE,
  PRIMARY KEY (IDEstudiante),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);
```

### **Paso 4: Migrar Datos**

```sql
-- Crear usuarios para cada estudiante del backup
INSERT INTO Usuario (Nombre, Apellido, Correo, Contrasena, IDRol)
SELECT 
  e.Nombre,
  e.Apellido,
  CONCAT(LOWER(e.Nombre), '.', LOWER(e.Apellido), '@lab.com'),  -- Generar correo
  'temporal123',  -- Contraseña temporal (cambiar después)
  (SELECT IDRol FROM Rol WHERE NombreRol = 'ESTUDIANTE')  -- Rol de estudiante
FROM Estudiante_Backup e;

-- Insertar estudiantes con referencia a usuario
INSERT INTO Estudiante (IDUsuario)
SELECT u.IDUsuario
FROM Usuario u
WHERE u.IDRol = (SELECT IDRol FROM Rol WHERE NombreRol = 'ESTUDIANTE');
```

### **Paso 5: Restaurar Foreign Keys**

```sql
-- Restaurar foreign key de Entrega
ALTER TABLE Entrega 
ADD CONSTRAINT Entrega_ibfk_2 
FOREIGN KEY (IDEstudiante) REFERENCES Estudiante(IDEstudiante);

-- Restaurar foreign key de Incidentes
ALTER TABLE Incidentes 
ADD CONSTRAINT Incidentes_ibfk_1 
FOREIGN KEY (IDEstudiante) REFERENCES Estudiante(IDEstudiante);
```

### **Paso 6: Actualizar Curso (si es necesario)**

```sql
-- Agregar campos a Curso si no existen
ALTER TABLE Curso 
ADD COLUMN Codigo VARCHAR(20) NOT NULL UNIQUE AFTER NombreCurso,
ADD COLUMN Descripcion VARCHAR(255) AFTER Codigo;
```

### **Paso 7: Limpiar**

```sql
-- Eliminar backup (opcional)
DROP TABLE IF EXISTS Estudiante_Backup;
```

---

## 🎯 **Cambios en el Backend:**

### **1. Entidad Estudiante:**

```java
@Entity
@Table(name = "Estudiante")
public class Estudiante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDEstudiante")
    private Integer idEstudiante;
    
    @OneToOne
    @JoinColumn(name = "IDUsuario", nullable = false, unique = true)
    private Usuario usuario;  // ✅ Ya no tiene nombre/apellido directo
}
```

### **2. Acceso a Nombre/Apellido:**

```java
// ANTES:
String nombre = estudiante.getNombre();
String apellido = estudiante.getApellido();

// DESPUÉS:
String nombre = estudiante.getUsuario().getNombre();
String apellido = estudiante.getUsuario().getApellido();
```

### **3. Repositories Actualizados:**

#### **DevolucionRepository:**
```java
// Buscar por IDUsuario del estudiante
@Query("SELECT d FROM Devolucion d WHERE d.entrega.estudiante.usuario.idUsuario = :idUsuario")
List<Devolucion> findByEstudiante(@Param("idUsuario") Integer idUsuario);
```

#### **IncidentesRepository:**
```java
// Buscar por IDUsuario del estudiante
@Query("SELECT i FROM Incidentes i WHERE i.estudiante.usuario.idUsuario = :idUsuario ORDER BY i.fechaIncidente DESC")
List<Incidentes> findByEstudianteUsuarioIdUsuario(@Param("idUsuario") Integer idUsuario);
```

---

## 🖥️ **Frontend:**

No hay cambios necesarios en el frontend, ya usa `idUsuario`:

```javascript
// DashboardEstudiante.jsx ya está correcto
const cargarDatosEstudiante = async (idUsuario) => {
  const responseDevoluciones = await devolucionService.getDevolucionesPorEstudiante(idUsuario);
  const responseIncidentes = await incidenteService.getIncidentesPorEstudiante(idUsuario);
  // ...
};
```

---

## 📝 **Archivos Modificados:**

### **Base de Datos:**
- ✅ `base_datos_kalium.sql` - Tabla Estudiante y Curso actualizadas

### **Backend:**
- ✅ `entity/Estudiante.java` - Relación con Usuario
- ✅ `entity/Curso.java` - Campos agregados
- ✅ `repository/DevolucionRepository.java` - Query actualizada
- ✅ `repository/IncidentesRepository.java` - Query agregada
- ✅ `service/IncidenteService.java` - Método actualizado

### **Frontend:**
- ✅ Sin cambios necesarios (ya usaba idUsuario)

---

## ✅ **Testing Después de la Migración:**

### **1. Verificar Login de Estudiante:**
```bash
POST /api/usuarios/login
{
  "correo": "juan.perez@lab.com",
  "contrasena": "temporal123"
}

# Debe devolver:
# - rol: "ESTUDIANTE"
# - Redirigir a /dashboard-estudiante
```

### **2. Verificar Dashboard:**
```bash
GET /api/devoluciones/estudiante/{idUsuario}
GET /api/incidentes/estudiante/{idUsuario}

# Deben devolver solo las del estudiante
```

### **3. Verificar Relaciones:**
```sql
-- Verificar que cada estudiante tiene un usuario
SELECT 
  e.IDEstudiante,
  u.Nombre,
  u.Apellido,
  u.Correo
FROM Estudiante e
JOIN Usuario u ON e.IDUsuario = u.IDUsuario;
```

---

## 🚀 **Pasos para Aplicar:**

1. **Respaldar la base de datos completa**
   ```bash
   mysqldump -u root -p kaliumdb > backup_kaliumdb.sql
   ```

2. **Ejecutar script de migración** (Pasos 1-7 de arriba)

3. **Reiniciar el backend** para que JPA reconozca los cambios

4. **Crear usuario de prueba:**
   ```sql
   INSERT INTO Usuario (Nombre, Apellido, Correo, Contrasena, IDRol)
   VALUES ('Juan', 'Pérez', 'juan.perez@lab.com', 'password123', 
           (SELECT IDRol FROM Rol WHERE NombreRol = 'ESTUDIANTE'));
   
   INSERT INTO Estudiante (IDUsuario)
   VALUES (LAST_INSERT_ID());
   ```

5. **Probar login** con el usuario creado

6. **Verificar dashboard** muestra solo sus datos

---

## 🎊 **Beneficios del Cambio:**

- ✅ **Consistencia**: Sigue el patrón de Admin e Instructor
- ✅ **Seguridad**: Estudiantes son usuarios autenticados
- ✅ **Integridad**: Un usuario puede tener un solo rol de estudiante
- ✅ **Escalabilidad**: Fácil agregar campos a Usuario
- ✅ **Mantenibilidad**: Código más limpio y consistente

---

## ⚠️ **Importante:**

- **No ejecutar** en producción sin respaldo
- **Probar primero** en ambiente de desarrollo
- **Actualizar contraseñas** después de la migración
- **Notificar** a los estudiantes sobre sus nuevos accesos

---

## 📚 **Próximos Pasos:**

1. Aplicar migración de BD
2. Reiniciar backend
3. Testing completo
4. Crear usuarios para estudiantes existentes
5. Enviar credenciales a estudiantes
6. Monitorear el sistema

**¡El sistema ahora es más robusto y consistente!** 🚀

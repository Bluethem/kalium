# 🔐 Sistema de Roles y Seguridad - Instrucciones

## ✅ **YA IMPLEMENTADO**

### **1. Login con Redirección por Rol**

El archivo `Login.jsx` ahora redirige automáticamente según el rol:

```javascript
// ✅ Ya implementado en Login.jsx
if (rolNombre === 'ADMIN' || rolNombre === 'Administrador') {
  navigate('/dashboard');
} else if (rolNombre === 'ESTUDIANTE' || rolNombre === 'Estudiante') {
  navigate('/dashboard-estudiante');
} else if (rolNombre === 'INSTRUCTOR' || rolNombre === 'Instructor') {
  navigate('/dashboard-instructor');
}
```

**Roles esperados en la BD:**
- `ADMIN` o `Administrador`
- `ESTUDIANTE` o `Estudiante`  
- `INSTRUCTOR` o `Instructor`

---

## 📋 **PENDIENTE - Para el compañero de Seguridad**

### **2. Proteger Rutas con ProtectedRoute**

He creado el componente `ProtectedRoute.jsx` que debes usar así:

#### **Ejemplo en App.jsx:**

```javascript
import ProtectedRoute from './components/ProtectedRoute';

// Ruta protegida solo para ADMIN
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Ruta protegida solo para ESTUDIANTE
<Route 
  path="/dashboard-estudiante" 
  element={
    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
      <DashboardEstudiante />
    </ProtectedRoute>
  } 
/>

// Ruta protegida solo para INSTRUCTOR
<Route 
  path="/dashboard-instructor" 
  element={
    <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
      <DashboardInstructor />
    </ProtectedRoute>
  } 
/>

// Ruta accesible para múltiples roles
<Route 
  path="/cuenta" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'ESTUDIANTE', 'INSTRUCTOR']}>
      <Cuenta />
    </ProtectedRoute>
  } 
/>
```

---

## 🔒 **Protección de Rutas - Ejemplo Completo**

### **App.jsx Actualizado:**

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardEstudiante from './pages/DashboardEstudiante';
// ... otros imports

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas para ADMIN */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Usuarios />
          </ProtectedRoute>
        } />
        
        <Route path="/insumos" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ListaInsumos />
          </ProtectedRoute>
        } />
        
        {/* Rutas protegidas para ESTUDIANTE */}
        <Route path="/dashboard-estudiante" element={
          <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
            <DashboardEstudiante />
          </ProtectedRoute>
        } />
        
        {/* Rutas protegidas para INSTRUCTOR */}
        <Route path="/dashboard-instructor" element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
            <DashboardInstructor />
          </ProtectedRoute>
        } />
        
        {/* Ruta accesible para todos los roles autenticados */}
        <Route path="/cuenta" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ESTUDIANTE', 'INSTRUCTOR']}>
            <Cuenta />
          </ProtectedRoute>
        } />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎯 **Comportamiento de ProtectedRoute**

### **Escenario 1: Usuario no autenticado**
```
Usuario intenta acceder a /dashboard
→ ProtectedRoute detecta que no hay usuario en localStorage
→ Redirige a /login
```

### **Escenario 2: Usuario ESTUDIANTE intenta acceder a ruta ADMIN**
```
Estudiante intenta acceder a /dashboard
→ ProtectedRoute detecta rol = 'ESTUDIANTE'
→ Rol no está en allowedRoles=['ADMIN']
→ Redirige a /dashboard-estudiante
```

### **Escenario 3: Usuario ADMIN accede a su ruta**
```
Admin intenta acceder a /dashboard
→ ProtectedRoute detecta rol = 'ADMIN'
→ Rol está en allowedRoles=['ADMIN']
→ ✅ Permite acceso
```

---

## 🔧 **Backend - Seguridad Adicional (Recomendado)**

Tu compañero de seguridad debería agregar:

### **1. Spring Security con JWT**

```java
// Ejemplo de configuración básica
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests()
                .requestMatchers("/api/usuarios/login", "/api/usuarios/register").permitAll()
                .requestMatchers("/api/usuarios/**", "/api/insumos/**").hasRole("ADMIN")
                .requestMatchers("/api/devoluciones/estudiante/**").hasRole("ESTUDIANTE")
                .anyRequest().authenticated()
            .and()
            .csrf().disable();
        
        return http.build();
    }
}
```

### **2. Anotaciones en Controllers**

```java
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodos() {
        // Solo ADMIN puede ver todos los usuarios
    }
    
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @GetMapping("/devoluciones/estudiante/{id}")
    public ResponseEntity<?> obtenerDevolucionesEstudiante(@PathVariable Integer id) {
        // Solo ESTUDIANTE puede ver sus devoluciones
    }
}
```

### **3. Validar que el estudiante solo vea SUS datos**

```java
@GetMapping("/devoluciones/estudiante/{id}")
public ResponseEntity<?> obtenerDevolucionesEstudiante(
    @PathVariable Integer id, 
    Authentication authentication
) {
    // Obtener usuario autenticado
    Usuario usuarioActual = (Usuario) authentication.getPrincipal();
    
    // Validar que solo pueda ver sus propias devoluciones
    if (!usuarioActual.getIdUsuario().equals(id)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body("No tienes permiso para ver las devoluciones de otro estudiante");
    }
    
    return ResponseEntity.ok(devolucionService.obtenerPorEstudiante(id));
}
```

---

## 📊 **Matriz de Permisos Sugerida**

| Ruta/Recurso | ADMIN | ESTUDIANTE | INSTRUCTOR |
|--------------|-------|------------|------------|
| `/dashboard` | ✅ | ❌ | ❌ |
| `/dashboard-estudiante` | ❌ | ✅ | ❌ |
| `/dashboard-instructor` | ❌ | ❌ | ✅ |
| `/usuarios` | ✅ | ❌ | ❌ |
| `/insumos` | ✅ | ❌ | ✅ (lectura) |
| `/pedidos` | ✅ | ❌ | ✅ |
| `/devoluciones` | ✅ | 🟡 (solo sus) | ✅ |
| `/incidentes` | ✅ | 🟡 (solo sus) | ✅ |
| `/cuenta` | ✅ | ✅ | ✅ |
| `/notificaciones` | ✅ | ✅ | ✅ |

---

## 🧪 **Testing**

### **Test 1: Login como Admin**
```
1. Login con usuario ADMIN
2. Verifica redirección a /dashboard
3. Verifica acceso a /usuarios, /insumos, etc.
4. Intenta acceder a /dashboard-estudiante → debe redirigir a /dashboard
```

### **Test 2: Login como Estudiante**
```
1. Login con usuario ESTUDIANTE
2. Verifica redirección a /dashboard-estudiante
3. Verifica que solo ve sus devoluciones e incidentes
4. Intenta acceder a /dashboard → debe redirigir a /dashboard-estudiante
```

### **Test 3: Sin autenticación**
```
1. Borrar localStorage
2. Intenta acceder a cualquier ruta protegida
3. Debe redirigir a /login
```

---

## 📝 **Checklist de Implementación**

### **Para tu compañero de Seguridad:**

- [ ] Implementar JWT en el backend
- [ ] Agregar Spring Security con roles
- [ ] Proteger endpoints con `@PreAuthorize`
- [ ] Validar que estudiantes solo vean SUS datos
- [ ] Validar que instructores solo vean SUS cursos
- [ ] Agregar `ProtectedRoute` a todas las rutas en `App.jsx`
- [ ] Testing completo de permisos
- [ ] Manejo de tokens expirados
- [ ] Refresh token (opcional)
- [ ] Logout que limpie localStorage

---

## 🚀 **Ya está Listo**

✅ Login con redirección por rol  
✅ Componente ProtectedRoute creado  
✅ Dashboard Estudiante filtra sus datos  
✅ Backend tiene endpoints por estudiante  

**Solo falta:**
- Aplicar `ProtectedRoute` en App.jsx
- Implementar JWT y Spring Security (backend)
- Testing completo

---

## 💡 **Ejemplo Rápido de Uso**

```javascript
// Antes (INSEGURO)
<Route path="/dashboard" element={<Dashboard />} />

// Después (SEGURO)
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**¡Ahora el sistema tiene redirección por rol y está listo para proteger todas las rutas!** 🔐

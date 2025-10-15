import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente para proteger rutas según el ROL del usuario
 * 
 * Uso:
 * <Route 
 *   path="/dashboard" 
 *   element={<ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>} 
 * />
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  // Obtener usuario del localStorage
  const usuarioStorage = localStorage.getItem('usuario');
  
  // Si no hay usuario, redirigir al login
  if (!usuarioStorage) {
    return <Navigate to="/login" replace />;
  }

  // Parsear usuario
  const usuario = JSON.parse(usuarioStorage);
  
  // Obtener rol del usuario (soporta objeto o string)
  const rolNombre = usuario.rol?.nombreRol || usuario.rol;
  
  // Si no hay roles permitidos especificados, permitir acceso
  if (allowedRoles.length === 0) {
    return children;
  }
  
  // Verificar si el rol del usuario está en la lista de roles permitidos
  const tieneAcceso = allowedRoles.some(rol => 
    rolNombre === rol || 
    rolNombre?.toUpperCase() === rol.toUpperCase()
  );
  
  // Si tiene acceso, mostrar el componente
  if (tieneAcceso) {
    return children;
  }
  
  // Si no tiene acceso, redirigir según su rol
  if (rolNombre === 'ESTUDIANTE' || rolNombre === 'Estudiante') {
    return <Navigate to="/dashboard-estudiante" replace />;
  } else if (rolNombre === 'INSTRUCTOR' || rolNombre === 'Instructor') {
    return <Navigate to="/dashboard-instructor" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
}

export default ProtectedRoute;

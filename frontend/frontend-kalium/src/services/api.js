import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Servicios para tu API Spring Boot
export const usuarioService = {
  // Obtener todos los usuarios
  getUsuarios: () => api.get('/usuarios'),
  
  // Obtener usuario por ID
  getUsuarioById: (id) => api.get(`/usuarios/${id}`),
  
  // Crear nuevo usuario
  createUsuario: (usuarioData) => api.post('/usuarios', usuarioData),
  
  // Actualizar usuario
  updateUsuario: (id, usuarioData) => api.put(`/usuarios/${id}`, usuarioData),
  
  // Eliminar usuario
  deleteUsuario: (id) => api.delete(`/usuarios/${id}`),
};

export const generalService = {
  // Obtener mensaje de prueba
  getMensaje: () => api.get('/mensaje'),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;
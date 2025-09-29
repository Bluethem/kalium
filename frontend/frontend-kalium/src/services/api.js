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

// Servicios para Usuarios
export const usuarioService = {
  getUsuarios: () => api.get('/usuarios'),
  getUsuarioById: (id) => api.get(`/usuarios/${id}`),
  createUsuario: (usuarioData) => api.post('/usuarios', usuarioData),
  updateUsuario: (id, usuarioData) => api.put(`/usuarios/${id}`, usuarioData),
  deleteUsuario: (id) => api.delete(`/usuarios/${id}`),
};

// Servicios para Insumos
export const insumoService = {
  // Insumos
  getInsumos: () => api.get('/insumos'),
  getInsumoById: (id) => api.get(`/insumos/${id}`),
  getInsumosPorEstado: (idEstado) => api.get(`/insumos/estado/${idEstado}`),
  getInsumosPorTipo: (idTipo) => api.get(`/insumos/tipo/${idTipo}`),
  createInsumo: (insumoData) => api.post('/insumos', insumoData),
  updateInsumo: (id, insumoData) => api.put(`/insumos/${id}`, insumoData),
  cambiarEstado: (idInsumo, idEstado) => api.patch(`/insumos/${idInsumo}/estado/${idEstado}`),
  deleteInsumo: (id) => api.delete(`/insumos/${id}`),
  
  // Tipos de Insumo
  getTiposInsumo: () => api.get('/insumos/tipos'),
  getTiposPorCategoria: (idCategoria) => api.get(`/insumos/tipos/categoria/${idCategoria}`),
  createTipoInsumo: (tipoData) => api.post('/insumos/tipos', tipoData),
};

// Servicios para Pedidos
export const pedidoService = {
  getPedidos: () => api.get('/pedidos'),
  getPedidoById: (id) => api.get(`/pedidos/${id}`),
  getPedidosPorInstructor: (idInstructor) => api.get(`/pedidos/instructor/${idInstructor}`),
  getPedidosPorEstado: (idEstado) => api.get(`/pedidos/estado/${idEstado}`),
  getDetallesPedido: (id) => api.get(`/pedidos/${id}/detalles`),
  createPedido: (pedidoData) => api.post('/pedidos', pedidoData),
  updatePedido: (id, pedidoData) => api.put(`/pedidos/${id}`, pedidoData),
  cambiarEstado: (idPedido, idEstado) => api.patch(`/pedidos/${idPedido}/estado/${idEstado}`),
  deletePedido: (id) => api.delete(`/pedidos/${id}`),
};

// Servicios para Entregas
export const entregaService = {
  getEntregas: () => api.get('/entregas'),
  getEntregaById: (id) => api.get(`/entregas/${id}`),
  getEntregasPorPedido: (idPedido) => api.get(`/entregas/pedido/${idPedido}`),
  getEntregasPorEstudiante: (idEstudiante) => api.get(`/entregas/estudiante/${idEstudiante}`),
  getInsumosPorEntrega: (id) => api.get(`/entregas/${id}/insumos`),
  getQuimicosPorEntrega: (id) => api.get(`/entregas/${id}/quimicos`),
  createEntrega: (entregaData) => api.post('/entregas', entregaData),
  createEntregaInsumo: (entregaInsumoData) => api.post('/entregas/insumos', entregaInsumoData),
  createEntregaQuimico: (entregaQuimicoData) => api.post('/entregas/quimicos', entregaQuimicoData),
  updateEntrega: (id, entregaData) => api.put(`/entregas/${id}`, entregaData),
  deleteEntrega: (id) => api.delete(`/entregas/${id}`),
};

// Servicios generales
export const generalService = {
  getMensaje: () => api.get('/mensaje'),
  healthCheck: () => api.get('/health'),
};

export default api;
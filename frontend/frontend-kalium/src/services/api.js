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
  getTiposInsumoConStock: () => api.get('/insumos/tipos/stock'),
  getTiposPorCategoria: (idCategoria) => api.get(`/insumos/tipos/categoria/${idCategoria}`),
  createTipoInsumo: (tipoData) => api.post('/insumos/tipos', tipoData),
};

// Servicios para Quimicos
export const quimicoService = {
  getQuimicos: () => api.get('/quimicos'),
  getQuimicoById: (id) => api.get(`/quimicos/${id}`),
  getQuimicosPorTipo: (idTipo) => api.get(`/quimicos/tipo/${idTipo}`),
  createQuimico: (quimicoData) => api.post('/quimicos', quimicoData),
  updateQuimico: (id, quimicoData) => api.put(`/quimicos/${id}`, quimicoData),
  cambiarEstado: (idQuimico, idEstado) => api.patch(`/quimicos/${idQuimico}/estado/${idEstado}`),
  deleteQuimico: (id) => api.delete(`/quimicos/${id}`),
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

export const entregasService = {
  getEntregas: () => api.get('/entregas'),
  getEntregaById: (id) => api.get(`/entregas/${id}`),
  getEntregasPorPedido: (idPedido) => api.get(`/entregas/pedido/${idPedido}`),
  getEntregasPorEstudiante: (idEstudiante) => api.get(`/entregas/estudiante/${idEstudiante}`),
  getInsumosPorEntrega: (id) => api.get(`/entregas/${id}/insumos`),
  getQuimicosPorEntrega: (id) => api.get(`/entregas/${id}/quimicos`),
  createEntrega: (data) => api.post('/entregas', data),

  crearEntregaInsumo: (data) => api.post('/entregas/insumos', data),
  crearEntregaQuimico: (data) => api.post('/entregas/quimicos', data),
  
  updateEntrega: (id, data) => api.put(`/entregas/${id}`, data),
  deleteEntrega: (id) => api.delete(`/entregas/${id}`),
  eliminarInsumo: (id) => api.delete(`/entregas/insumos/${id}`),
  eliminarQuimico: (id) => api.delete(`/entregas/quimicos/${id}`),
};

// Servicios para Reportes
export const reporteService = {
  getReporteInventario: (fechaInicio, fechaFin, categoria) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    if (categoria) params.append('categoria', categoria);
    return api.get(`/reportes/inventario?${params.toString()}`);
  },
};

// Servicios generales
export const generalService = {
  getMensaje: () => api.get('/mensaje'),
  healthCheck: () => api.get('/health'),
};

// Servicios para Instructores
export const instructorService = {
  getInstructores: () => api.get('/instructores'),
  getInstructorById: (id) => api.get(`/instructores/${id}`),
};

// Servicios para Cursos
export const cursoService = {
  getCursos: () => api.get('/cursos'),
  getCursoById: (id) => api.get(`/cursos/${id}`),
};

// Servicios para Tipos de Pedido
export const tipoPedidoService = {
  getTiposPedido: () => api.get('/tipos-pedido'),
};

// Servicios para Pedido Detalle (ya existe pero lo completo)
export const pedidoDetalleService = {
  getPedidoDetalles: () => api.get('/pedidos-detalle'),
  getPedidoDetalleById: (id) => api.get(`/pedidos-detalle/${id}`),
  createPedidoDetalle: (detalleData) => api.post('/pedidos-detalle', detalleData),
  updatePedidoDetalle: (id, detalleData) => api.put(`/pedidos-detalle/${id}`, detalleData),
  deletePedidoDetalle: (id) => api.delete(`/pedidos-detalle/${id}`),
};

// Servicios para Notificaciones
export const notificacionService = {
  getNotificacionesPorUsuario: (idUsuario) => api.get(`/notificaciones/usuario/${idUsuario}`),
  getNotificacionesNoLeidas: (idUsuario) => api.get(`/notificaciones/usuario/${idUsuario}/no-leidas`),
  getContadorNoLeidas: (idUsuario) => api.get(`/notificaciones/usuario/${idUsuario}/count`),
  getResumen: (idUsuario) => api.get(`/notificaciones/usuario/${idUsuario}/resumen`),
  marcarComoLeida: (idNotificacion) => api.patch(`/notificaciones/${idNotificacion}/leer`),
  marcarTodasComoLeidas: (idUsuario) => api.patch(`/notificaciones/usuario/${idUsuario}/leer-todas`),
  eliminarNotificacion: (idNotificacion) => api.delete(`/notificaciones/${idNotificacion}`),
  limpiarLeidas: (idUsuario) => api.delete(`/notificaciones/usuario/${idUsuario}/limpiar`),
  verificarStock: () => api.post('/notificaciones/verificar-stock'),
};

// Servicios para Horarios
export const horarioService = {
  getHorarios: () => api.get('/horarios'),
  getHorarioById: (id) => api.get(`/horarios/${id}`),
  getHorariosDisponibles: () => api.get('/horarios/disponibles'),
  createHorario: (horarioData) => api.post('/horarios', horarioData),
  updateHorario: (id, horarioData) => api.put(`/horarios/${id}`, horarioData),
  deleteHorario: (id) => api.delete(`/horarios/${id}`),
};

// Servicios para Incidentes
export const incidenteService = {
  getIncidentes: () => api.get('/incidentes'),
  getIncidenteById: (id) => api.get(`/incidentes/${id}`),
  getIncidentesPorEstado: (idEstado) => api.get(`/incidentes/estado/${idEstado}`),
  getIncidentesPorEstudiante: (idEstudiante) => api.get(`/incidentes/estudiante/${idEstudiante}`),
  getIncidentesPorDevolucion: (idDevolucion) => api.get(`/incidentes/devolucion/${idDevolucion}`),
  createIncidente: (incidenteData) => api.post('/incidentes', incidenteData),
  updateIncidente: (id, incidenteData) => api.put(`/incidentes/${id}`, incidenteData),
  cambiarEstado: (idIncidente, idEstado) => api.patch(`/incidentes/${idIncidente}/estado/${idEstado}`),
  resolverIncidente: (id) => api.patch(`/incidentes/${id}/resolver`),
  deleteIncidente: (id) => api.delete(`/incidentes/${id}`),
  getEstadosIncidente: () => api.get('/incidentes/estados'),
  ponerEnRevision: (id) => api.patch(`/incidentes/${id}/estado/2`),
  cancelarIncidente: (id) => api.patch(`/incidentes/${id}/cancelar`),
};

// Servicios para Entregas
export const entregaService = {
  getEntregas: () => api.get('/entregas'),
  getEntregaById: (id) => api.get(`/entregas/${id}`),
  getEntregasPorPedido: (idPedido) => api.get(`/entregas/pedido/${idPedido}`),
  getEntregasPorEstudiante: (idEstudiante) => api.get(`/entregas/estudiante/${idEstudiante}`),
  getInsumosPorEntrega: (id) => api.get(`/entregas/${id}/insumos`),
  getQuimicosPorEntrega: (id) => api.get(`/entregas/${id}/quimicos`),
  createEntrega: (data) => api.post('/entregas', data),
  updateEntrega: (id, data) => api.put(`/entregas/${id}`, data),
  deleteEntrega: (id) => api.delete(`/entregas/${id}`),
};

// Servicios para Estudiantes
export const estudianteService = {
  getEstudiantes: () => api.get('/estudiantes'),
  getEstudianteById: (id) => api.get(`/estudiantes/${id}`),
};

export const devolucionService = {
  getDevoluciones: () => api.get('/devoluciones'),
  getDevolucionById: (id) => api.get(`/devoluciones/${id}`),
  getDevolucionesPorPedido: (idPedido) => api.get(`/devoluciones/pedido/${idPedido}`),
  getDevolucionesPorEstado: (idEstado) => api.get(`/devoluciones/estado/${idEstado}`),
  createDevolucion: (data) => api.post('/devoluciones', data),
  updateDevolucion: (id, data) => api.put(`/devoluciones/${id}`, data),
  deleteDevolucion: (id) => api.delete(`/devoluciones/${id}`),
};

export const estDevolucionService = {
  getEstados: () => api.get('/estados-devolucion'),
};

export const experimentoService = {
  getExperimentos: () => api.get('/experimentos'),
  getExperimentoById: (id) => api.get(`/experimentos/${id}`),
  getDetallesExperimento: (id) => api.get(`/experimentos/${id}/detalles`),
  createExperimento: (data) => api.post('/experimentos', data),
  agregarDetalle: (data) => api.post('/experimentos/detalles', data),
  updateExperimento: (id, data) => api.put(`/experimentos/${id}`, data),
  deleteExperimento: (id) => api.delete(`/experimentos/${id}`),
  eliminarDetalle: (id) => api.delete(`/experimentos/detalles/${id}`),
};

export default api;
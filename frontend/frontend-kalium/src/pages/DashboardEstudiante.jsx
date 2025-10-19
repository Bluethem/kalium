import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import { devolucionService, incidenteService } from '../services/api';
import logger from '../utils/logger';
import { useNavigate } from 'react-router-dom';

function DashboardEstudiante() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalDevoluciones: 0,
    devolucionesPendientes: 0,
    devolucionesAprobadas: 0,
    totalIncidentes: 0,
    incidentesPendientes: 0,
    incidentesResueltos: 0,
  });
  const [devoluciones, setDevoluciones] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('resumen'); // 'resumen', 'devoluciones', 'incidentes'

  useEffect(() => {
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
      const parsed = JSON.parse(usuarioStorage);
      setUsuario(parsed);
      cargarDatosEstudiante(parsed.idUsuario);
    }
  }, []);

  const cargarDatosEstudiante = async (idUsuario) => {
    setLoading(true);
    try {
      // Cargar devoluciones del estudiante
      const responseDevoluciones = await devolucionService.getDevolucionesPorEstudiante(idUsuario);
      setDevoluciones(responseDevoluciones.data);

      // Cargar incidentes del estudiante
      const responseIncidentes = await incidenteService.getIncidentesPorEstudiante(idUsuario);
      setIncidentes(responseIncidentes.data);

      // Calcular estadísticas
      calcularEstadisticas(responseDevoluciones.data, responseIncidentes.data);
    } catch (error) {
      logger.error('Error al cargar datos del estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (devols, incids) => {
    setEstadisticas({
      totalDevoluciones: devols.length,
      devolucionesPendientes: devols.filter(d => d.idEstadoDevolucion === 1).length,
      devolucionesAprobadas: devols.filter(d => d.idEstadoDevolucion === 2).length,
      totalIncidentes: incids.length,
      incidentesPendientes: incids.filter(i => i.idEstado === 1).length,
      incidentesResueltos: incids.filter(i => i.idEstado === 3).length,
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const obtenerColorEstadoDevolucion = (idEstado) => {
    switch (idEstado) {
      case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 3: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const obtenerColorEstadoIncidente = (idEstado) => {
    switch (idEstado) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 3: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const obtenerNombreEstadoDevolucion = (idEstado) => {
    const estados = { 1: 'Pendiente', 2: 'Aprobada', 3: 'Rechazada' };
    return estados[idEstado] || 'Desconocido';
  };

  const obtenerNombreEstadoIncidente = (idEstado) => {
    const estados = { 1: 'Reportado', 2: 'En Revisión', 3: 'Resuelto', 4: 'Cancelado' };
    return estados[idEstado] || 'Desconocido';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] dark:bg-[#111827]">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Encabezado mejorado */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Mi Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Bienvenido, {usuario?.nombre || 'Estudiante'}
            </p>
          </div>

          {/* Navegación de pestañas mejorada */}
          <div className="flex justify-center mb-10">
            <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setVistaActual('resumen')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  vistaActual === 'resumen'
                    ? 'bg-[#34D399] text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setVistaActual('devoluciones')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  vistaActual === 'devoluciones'
                    ? 'bg-[#34D399] text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Mis Devoluciones
              </button>
              <button
                onClick={() => setVistaActual('incidentes')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  vistaActual === 'incidentes'
                    ? 'bg-[#34D399] text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Mis Incidentes
              </button>
            </div>
          </div>

          {/* Vista Resumen Mejorada */}
          {vistaActual === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card: Total Devoluciones */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Devoluciones
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                    {estadisticas.totalDevoluciones}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">
                    swap_horiz
                  </span>
                </div>
              </div>

              {/* Card de Mis Entregas - NUEVO */}
              <div 
                onClick={() => navigate('/mis-entregas')}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mis Entregas
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      Ver
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">
                      inventory_2
                    </span>
                  </div>
                </div>
              </div>

              {/* Card: Devoluciones Pendientes */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Devoluciones Pendientes
                  </p>
                  <p className="text-4xl font-bold text-yellow-500 dark:text-yellow-400 mt-1">
                    {estadisticas.devolucionesPendientes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-500 dark:text-yellow-400">
                    hourglass_empty
                  </span>
                </div>
              </div>

              {/* Card: Devoluciones Aprobadas */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Devoluciones Aprobadas
                  </p>
                  <p className="text-4xl font-bold text-green-500 dark:text-green-400 mt-1">
                    {estadisticas.devolucionesAprobadas}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 dark:text-green-400">
                    check_circle_outline
                  </span>
                </div>
              </div>

              {/* Card: Total Incidentes */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Incidentes
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                    {estadisticas.totalIncidentes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 dark:text-red-400">
                    warning_amber
                  </span>
                </div>
              </div>

              {/* Card: Incidentes Pendientes */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Incidentes Pendientes
                  </p>
                  <p className="text-4xl font-bold text-red-500 dark:text-red-400 mt-1">
                    {estadisticas.incidentesPendientes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 dark:text-red-400">
                    error_outline
                  </span>
                </div>
              </div>

              {/* Card: Incidentes Resueltos */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Incidentes Resueltos
                  </p>
                  <p className="text-4xl font-bold text-green-500 dark:text-green-400 mt-1">
                    {estadisticas.incidentesResueltos}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 dark:text-green-400">
                    task_alt
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Vista Devoluciones */}
        {vistaActual === 'devoluciones' && (
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Mis Devoluciones
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha Devolución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {devoluciones.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No tienes devoluciones registradas
                      </td>
                    </tr>
                  ) : (
                    devoluciones.map((dev) => (
                      <tr key={dev.idDevolucion} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          #{dev.idDevolucion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatearFecha(dev.fechaDevolucion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${obtenerColorEstadoDevolucion(dev.idEstadoDevolucion)}`}>
                            {obtenerNombreEstadoDevolucion(dev.idEstadoDevolucion)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {dev.observaciones || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Vista Incidentes */}
        {vistaActual === 'incidentes' && (
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Mis Incidentes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha Reporte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acción Tomada
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {incidentes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No tienes incidentes registrados
                      </td>
                    </tr>
                  ) : (
                    incidentes.map((inc) => (
                      <tr key={inc.idIncidente} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          #{inc.idIncidente}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {inc.descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatearFecha(inc.fechaReporte)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${obtenerColorEstadoIncidente(inc.idEstado)}`}>
                            {obtenerNombreEstadoIncidente(inc.idEstado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {inc.accionTomada || 'Sin acción aún'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        </div>
      </main>
    </div>
  );
}

export default DashboardEstudiante;

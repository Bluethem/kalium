import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { incidenteService } from '../../services/api';

const ListaIncidentes = () => {
  const navigate = useNavigate();
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    estudiante: '',
    busqueda: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    cargarIncidentes();
  }, []);

  const cargarIncidentes = async () => {
    try {
      setLoading(true);
      const response = await incidenteService.getIncidentes();
      setIncidentes(response.data);
    } catch (error) {
      console.error('Error al cargar incidentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const incidentesFiltrados = useMemo(() => {
    return incidentes.filter(incidente => {
      // Filtro por estado
      if (filtros.estado) {
        const estadoNombre = incidente.estIncidente?.estadoIncidente?.toLowerCase();
        if (estadoNombre !== filtros.estado.toLowerCase()) {
          return false;
        }
      }

      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const descripcion = incidente.descripcion?.toLowerCase() || '';
        const nombreEstudiante = `${incidente.estudiante?.usuario?.nombre || ''} ${incidente.estudiante?.usuario?.apellido || ''}`.toLowerCase();
        
        if (!descripcion.includes(busqueda) && !nombreEstudiante.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });
  }, [incidentes, filtros]);

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      estudiante: '',
      busqueda: ''
    });
    setPaginaActual(1);
  };

  // Paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const incidentesPaginados = incidentesFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(incidentesFiltrados.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Reportado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'En Revisión': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const hayFiltrosActivos = filtros.estado || filtros.busqueda;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando incidentes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Incidentes
            </h2>
            <button
              onClick={() => navigate('/incidentes/nuevo')}
              className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo Incidente
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  placeholder="Descripción o estudiante..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                />
              </div>

              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="Reportado">Reportado</option>
                  <option value="En Revisión">En Revisión</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Botón Limpiar */}
              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {hayFiltrosActivos && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Mostrando {incidentesFiltrados.length} de {incidentes.length} incidentes
              </div>
            )}
          </div>

          {/* Tabla de Incidentes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      ID Incidente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Fecha Incidente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Fecha Solución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Devolución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {incidentesPaginados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {hayFiltrosActivos 
                          ? 'No se encontraron incidentes con los filtros aplicados' 
                          : 'No hay incidentes registrados'}
                      </td>
                    </tr>
                  ) : (
                    incidentesPaginados.map((incidente) => (
                      <tr key={incidente.idIncidentes} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          #INC{String(incidente.idIncidentes).padStart(3, '0')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {incidente.descripcion}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {incidente.fechaIncidente ? new Date(incidente.fechaIncidente).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {incidente.fechaSolucion ? new Date(incidente.fechaSolucion).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {incidente.devolucion ? (
                            <button
                              onClick={() => navigate(`/devoluciones/${incidente.devolucion?.idDevolucion}`)}
                              className="text-[rgb(44,171,91)] hover:underline"
                            >
                              #DEV{String(incidente.devolucion?.idDevolucion || 0).padStart(3, '0')}
                            </button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {incidente.estudiante?.usuario?.nombre} {incidente.estudiante?.usuario?.apellido}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(incidente.estIncidente?.estadoIncidente)}`}>
                            {incidente.estIncidente?.estadoIncidente || 'Sin estado'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                          <div className="flex items-center justify-center gap-2">
                            {/* Botón según el estado */}
                            {incidente.estIncidente?.idEstIncidente === 1 && (
                              // REPORTADO → Mostrar "Poner en Revisión"
                              <button
                                onClick={async () => {
                                  try {
                                    await incidenteService.ponerEnRevision(incidente.idIncidentes);
                                    cargarIncidentes();
                                  } catch (error) {
                                    console.error('Error:', error);
                                    alert(error.response?.data || 'No se pudo poner en revisión');
                                  }
                                }}
                                className="flex items-center gap-1 rounded-md bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Poner en Revisión
                              </button>
                            )}

                            {incidente.estIncidente?.idEstIncidente === 2 && (
                              // EN REVISIÓN → Mostrar "Resolver"
                              <button
                                onClick={async () => {
                                  if (!window.confirm('¿Está seguro de resolver este incidente?')) return;
                                  try {
                                    await incidenteService.resolverIncidente(incidente.idIncidentes);
                                    cargarIncidentes();
                                  } catch (error) {
                                    console.error('Error:', error);
                                    alert(error.response?.data || 'No se pudo resolver. Debe estar EN REVISIÓN.');
                                  }
                                }}
                                className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Resolver
                              </button>
                            )}

                            {(incidente.estIncidente?.idEstIncidente === 3 || incidente.estIncidente?.idEstIncidente === 4) && (
                              // RESUELTO o CANCELADO → Sin botón de acción
                              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {incidente.estIncidente?.idEstIncidente === 3 ? 'Resuelto' : 'Cancelado'}
                              </span>
                            )}

                            {/* Botón Ver Detalle (siempre visible) */}
                            <button
                              onClick={() => navigate(`/incidentes/${incidente.idIncidentes}`)}
                              className="text-[rgb(44,171,91)] hover:underline text-xs font-medium"
                            >
                              Ver detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span className="font-medium">{indexPrimero + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(indexUltimo, incidentesFiltrados.length)}</span> de{' '}
                      <span className="font-medium">{incidentesFiltrados.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Anterior</span>
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      {[...Array(totalPaginas)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => cambiarPagina(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            paginaActual === i + 1
                              ? 'z-10 bg-[rgb(44,171,91)] border-[rgb(44,171,91)] text-white'
                              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Siguiente</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListaIncidentes;
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

  const handleResolver = async (idIncidente) => {
    if (!window.confirm('¿Está seguro de marcar este incidente como resuelto?')) return;
    
    try {
      await incidenteService.resolverIncidente(idIncidente);
      cargarIncidentes();
    } catch (error) {
      console.error('Error al resolver incidente:', error);
      alert('No se pudo resolver el incidente');
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Reportado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'En Revisión': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
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
              className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo Incidente
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Búsqueda */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                  <input
                    type="text"
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                    placeholder="Buscar por descripción o estudiante..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por Estado */}
              <div className="relative">
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                  className="appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <option value="">Todos los estados</option>
                  <option value="reportado">Reportado</option>
                  <option value="en revisión">En Revisión</option>
                  <option value="resuelto">Resuelto</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                  expand_more
                </span>
              </div>

              {/* Botón limpiar filtros */}
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">filter_alt_off</span>
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Contador de resultados */}
            {hayFiltrosActivos && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-semibold">{incidentesFiltrados.length}</span> de{' '}
                <span className="font-semibold">{incidentes.length}</span> incidentes
              </div>
            )}
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                        <button
                          onClick={() => navigate(`/devoluciones/${incidente.devolucion?.idDevolucion}`)}
                          className="text-[rgb(44,171,91)] hover:underline"
                        >
                          #DEV{String(incidente.devolucion?.idDevolucion || 0).padStart(3, '0')}
                        </button>
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
                          {incidente.estIncidente?.estadoIncidente !== 'Resuelto' && (
                            <button
                              onClick={() => handleResolver(incidente.idIncidentes)}
                              className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Resolver
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/incidentes/${incidente.idIncidentes}`)}
                            className="text-[rgb(44,171,91)] hover:underline"
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
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, incidentesFiltrados.length)} de {incidentesFiltrados.length} incidentes
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {[...Array(totalPaginas)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => cambiarPagina(index + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      paginaActual === index + 1
                        ? 'bg-[rgb(44,171,91)] text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListaIncidentes;
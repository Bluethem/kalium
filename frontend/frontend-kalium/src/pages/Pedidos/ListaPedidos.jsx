import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { pedidoService } from '../../services/api';

const ListaPedidos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    curso: '',
    tipoPedido: ''
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await pedidoService.getPedidos();
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTRADO FUNCIONAL - Aplicar filtros a los pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      // Filtro por estado
      if (filtros.estado) {
        const estadoNombre = pedido.estPedido?.nombreEstPedido?.toLowerCase();
        if (estadoNombre !== filtros.estado.toLowerCase()) {
          return false;
        }
      }

      // Filtro por curso
      if (filtros.curso) {
        const cursoNombre = pedido.curso?.nombreCurso?.toLowerCase();
        if (!cursoNombre?.includes(filtros.curso.toLowerCase())) {
          return false;
        }
      }

      // Filtro por tipo de pedido
      if (filtros.tipoPedido) {
        const tipoPedidoNombre = pedido.tipoPedido?.nombrePedido?.toLowerCase();
        if (!tipoPedidoNombre?.includes(filtros.tipoPedido.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [pedidos, filtros]);

  // ✅ Extraer opciones únicas de cursos y tipos de pedido
  const cursosUnicos = useMemo(() => {
    const cursos = pedidos
      .map(p => p.curso)
      .filter(c => c && c.nombreCurso);
    const uniqueCursos = Array.from(new Set(cursos.map(c => c.idCurso)))
      .map(id => cursos.find(c => c.idCurso === id));
    return uniqueCursos;
  }, [pedidos]);

  const tiposPedidoUnicos = useMemo(() => {
    const tipos = pedidos
      .map(p => p.tipoPedido)
      .filter(t => t && t.nombrePedido);
    const uniqueTipos = Array.from(new Set(tipos.map(t => t.idTipoPedido)))
      .map(id => tipos.find(t => t.idTipoPedido === id));
    return uniqueTipos;
  }, [pedidos]);

  // ✅ Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      curso: '',
      tipoPedido: ''
    });
  };

  const handleAprobar = async (idPedido) => {
    try {
      await pedidoService.cambiarEstado(idPedido, 2);
      cargarPedidos();
    } catch (error) {
      console.error('Error al aprobar pedido:', error);
      alert('No se pudo aprobar el pedido');
    }
  };

  const handleRechazar = async (idPedido) => {
    if (!window.confirm('¿Está seguro de rechazar este pedido?')) return;
    
    try {
      await pedidoService.cambiarEstado(idPedido, 3);
      cargarPedidos();
    } catch (error) {
      console.error('Error al rechazar pedido:', error);
      alert('No se pudo rechazar el pedido');
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Pendiente': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'En Proceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  // ✅ Verificar si hay filtros activos
  const hayFiltrosActivos = filtros.estado || filtros.curso || filtros.tipoPedido;
  
  // Cálculos de paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina);
  const indexInicio = (paginaActual - 1) * itemsPorPagina;
  const indexFin = indexInicio + itemsPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indexInicio, indexFin);
  
  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros, itemsPorPagina]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando pedidos...</p>
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
              Gestión de Pedidos
            </h2>
            <button
              onClick={() => navigate('/pedidos/nuevo')}
              className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo Pedido
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                  className="appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="en proceso">En Proceso</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={filtros.curso}
                  onChange={(e) => setFiltros({...filtros, curso: e.target.value})}
                  className="appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <option value="">Todos los cursos</option>
                  {cursosUnicos.map(curso => (
                    <option key={curso.idCurso} value={curso.nombreCurso}>
                      {curso.nombreCurso}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={filtros.tipoPedido}
                  onChange={(e) => setFiltros({...filtros, tipoPedido: e.target.value})}
                  className="appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <option value="">Todos los tipos</option>
                  {tiposPedidoUnicos.map(tipo => (
                    <option key={tipo.idTipoPedido} value={tipo.nombrePedido}>
                      {tipo.nombrePedido}
                    </option>
                  ))}
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
                Mostrando <span className="font-semibold">{pedidosFiltrados.length}</span> de{' '}
                <span className="font-semibold">{pedidos.length}</span> pedidos
              </div>
            )}
          </div>

          {/* Información de resultados y selector de items por página */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando <span className="font-semibold">{indexInicio + 1}</span> a{' '}
              <span className="font-semibold">{Math.min(indexFin, pedidosFiltrados.length)}</span> de{' '}
              <span className="font-semibold">{pedidosFiltrados.length}</span> resultados
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="itemsPorPagina" className="text-sm text-gray-600 dark:text-gray-400">
                Mostrar:
              </label>
              <select
                id="itemsPorPagina"
                value={itemsPorPagina}
                onChange={(e) => setItemsPorPagina(Number(e.target.value))}
                className="rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-1 px-3 text-sm focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">por página</span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    ID del pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Grupos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Entrega
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {hayFiltrosActivos 
                        ? 'No se encontraron pedidos con los filtros aplicados' 
                        : 'No hay pedidos registrados'}
                    </td>
                  </tr>
                ) : (
                  pedidosPaginados.map((pedido) => (
                    <tr key={pedido.idPedido} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        #{String(pedido.idPedido).padStart(5, '0')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {pedido.cantGrupos}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {pedido.instructor?.usuario?.nombre} {pedido.instructor?.usuario?.apellido}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(pedido.estPedido?.nombreEstPedido)}`}>
                          {pedido.estPedido?.nombreEstPedido || 'Sin estado'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {pedido.curso?.nombreCurso || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {pedido.tipoPedido?.nombrePedido || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {pedido.horario?.horaInicio ? new Date(pedido.horario.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                        {pedido.estPedido?.nombreEstPedido === 'Pendiente' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleAprobar(pedido.idPedido)}
                              className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRechazar(pedido.idPedido)}
                              className="flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              Rechazar
                            </button>
                            <button
                              onClick={() => navigate(`/pedidos/${pedido.idPedido}`)}
                              className="text-[rgb(44,171,91)] hover:underline"
                            >
                              Ver
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/pedidos/${pedido.idPedido}`)}
                            className="text-[rgb(44,171,91)] hover:underline"
                          >
                            Ver detalle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Página <span className="font-semibold">{paginaActual}</span> de{' '}
                <span className="font-semibold">{totalPaginas}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Botón Primera Página */}
                <button
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  <span className="material-symbols-outlined text-base">first_page</span>
                </button>

                {/* Botón Anterior */}
                <button
                  onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Página anterior"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>

                {/* Números de página */}
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pageNum;
                    if (totalPaginas <= 5) {
                      pageNum = i + 1;
                    } else if (paginaActual <= 3) {
                      pageNum = i + 1;
                    } else if (paginaActual >= totalPaginas - 2) {
                      pageNum = totalPaginas - 4 + i;
                    } else {
                      pageNum = paginaActual - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPaginaActual(pageNum)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          paginaActual === pageNum
                            ? 'bg-[rgb(44,171,91)] text-white border-[rgb(44,171,91)]'
                            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Página siguiente"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>

                {/* Botón Última Página */}
                <button
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  <span className="material-symbols-outlined text-base">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListaPedidos;
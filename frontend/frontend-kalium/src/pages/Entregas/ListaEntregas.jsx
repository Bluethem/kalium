import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { entregaService, pedidoService } from '../../services/api';

const ListaEntregas = () => {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estudiante: '',
    pedido: '',
    busqueda: ''
  });
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [entregasRes, pedidosRes] = await Promise.all([
        entregaService.getEntregas(),
        pedidoService.getPedidos()
      ]);
      
      setEntregas(entregasRes.data || []);
      
      // Filtrar pedidos aprobados/en preparación sin entregas
      const pedidosAprobados = (pedidosRes.data || []).filter(
        p => p.estPedido?.idEstPedido === 2 || p.estPedido?.idEstPedido === 3
      );
      
      // Verificar cuáles no tienen entregas
      const pedidosConEntrega = new Set(
        (entregasRes.data || []).map(e => e.pedido?.idPedido)
      );
      
      const pendientes = pedidosAprobados.filter(
        p => !pedidosConEntrega.has(p.idPedido)
      );
      
      setPedidosPendientes(pendientes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const entregasFiltradas = useMemo(() => {
    return entregas.filter(entrega => {
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const idEntrega = `#ENT${String(entrega.idEntrega).padStart(3, '0')}`.toLowerCase();
        const nombreEstudiante = `${entrega.estudiante?.usuario?.nombre || ''} ${entrega.estudiante?.usuario?.apellido || ''}`.toLowerCase();
        const idPedido = `#PED${String(entrega.pedido?.idPedido || 0).padStart(3, '0')}`.toLowerCase();
        
        if (!idEntrega.includes(busqueda) && 
            !nombreEstudiante.includes(busqueda) && 
            !idPedido.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });
  }, [entregas, filtros]);

  // Lógica de paginación
  const totalPaginas = Math.ceil(entregasFiltradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const entregasPaginadas = entregasFiltradas.slice(indiceInicio, indiceFin);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros, itemsPorPagina]);

  const limpiarFiltros = () => {
    setFiltros({
      estudiante: '',
      pedido: '',
      busqueda: ''
    });
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const formatearFechaHora = (fecha, hora) => {
    if (!hora) return 'N/A';
    const fechaHora = new Date(hora);
    return fechaHora.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hayFiltrosActivos = filtros.busqueda;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando entregas...</p>
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Entregas
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Genera entregas automáticamente desde los pedidos aprobados
            </p>
          </div>

          {/* Pedidos Pendientes de Generar Entregas */}
          {pedidosPendientes.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                    pending_actions
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Pedidos Listos para Generar Entregas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pedidosPendientes.length} pedido(s) aprobado(s) sin entregas generadas
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {pedidosPendientes.map((pedido) => (
                  <div
                    key={pedido.idPedido}
                    className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[rgb(44,171,91)]/10 dark:bg-[rgb(44,171,91)]/20">
                        <span className="material-symbols-outlined text-[rgb(44,171,91)] dark:text-white text-2xl">
                          assignment
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            Pedido #{String(pedido.idPedido).padStart(3, '0')}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pedido.estPedido?.idEstPedido === 2 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          }`}>
                            {pedido.estPedido?.nombreEstPedido}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">school</span>
                            {pedido.curso?.nombreCurso}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">groups</span>
                            {pedido.cantGrupos} grupos
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">person</span>
                            {pedido.instructor?.usuario?.nombre} {pedido.instructor?.usuario?.apellido}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/entregas/generar/${pedido.idPedido}`)}
                      className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition-all hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-base">inventory_2</span>
                      Generar {pedido.cantGrupos} Entregas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    placeholder="Buscar por ID, estudiante o pedido..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                  />
                </div>
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
                Mostrando <span className="font-semibold">{entregasFiltradas.length}</span> de{' '}
                <span className="font-semibold">{entregas.length}</span> entregas
              </div>
            )}
          </div>

          {/* Tabla de Entregas Registradas */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Entregas Registradas
          </h3>
          
          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    ID Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Pedido Asociado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {entregasPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {hayFiltrosActivos 
                        ? 'No se encontraron entregas con los filtros aplicados' 
                        : 'No hay entregas registradas'}
                    </td>
                  </tr>
                ) : (
                  entregasPaginadas.map((entrega) => (
                    <tr key={entrega.idEntrega} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        #ENT{String(entrega.idEntrega).padStart(3, '0')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatearFechaHora(entrega.fechaEntrega, entrega.horaEntrega)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/pedidos/${entrega.pedido?.idPedido}`)}
                          className="text-[rgb(44,171,91)] hover:underline"
                        >
                          #PED{String(entrega.pedido?.idPedido || 0).padStart(3, '0')}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {entrega.estudiante?.usuario?.nombre} {entrega.estudiante?.usuario?.apellido}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                        <button
                          onClick={() => navigate(`/entregas/${entrega.idEntrega}`)}
                          className="text-[rgb(44,171,91)] hover:underline"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginación */}
          {entregasFiltradas.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800">
              {/* Selector de items por página */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar</span>
                <select
                  value={itemsPorPagina}
                  onChange={(e) => setItemsPorPagina(Number(e.target.value))}
                  className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  de {entregasFiltradas.length} entregas
                </span>
              </div>

              {/* Navegación de páginas */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarPagina(1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ««
                </button>
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  «
                </button>
                
                <span className="px-4 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Página <span className="font-semibold">{paginaActual}</span> de <span className="font-semibold">{totalPaginas}</span>
                </span>

                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  »
                </button>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListaEntregas;
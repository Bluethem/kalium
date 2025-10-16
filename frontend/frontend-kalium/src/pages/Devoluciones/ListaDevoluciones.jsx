import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { devolucionService } from '../../services/api';

const ListaDevoluciones = () => {
  const navigate = useNavigate();
  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    busqueda: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;
  const [procesando, setProcesando] = useState(null);
  const [modalRechazo, setModalRechazo] = useState({ mostrar: false, idDevolucion: null });
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [devolucionesCompletas, setDevolucionesCompletas] = useState({});

  useEffect(() => {
    cargarDevoluciones();
  }, []);

  const cargarDevoluciones = async () => {
    try {
      setLoading(true);
      const response = await devolucionService.getDevoluciones();
      setDevoluciones(response.data);
      
      // ✅ Verificar cuáles están completas
      const completasMap = {};
      for (const dev of response.data) {
        if (dev.estDevolucion?.idEstDevolucion === 1) { // Solo verificar pendientes
          try {
            const completa = await devolucionService.verificarCompleta(dev.idDevolucion);
            completasMap[dev.idDevolucion] = completa.data;
          } catch (error) {
            completasMap[dev.idDevolucion] = false;
          }
        }
      }
      setDevolucionesCompletas(completasMap);
    } catch (error) {
      console.error('Error al cargar devoluciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const devolucionesFiltradas = useMemo(() => {
    return devoluciones.filter(devolucion => {
      // Filtro por estado
      if (filtros.estado) {
        const estadoNombre = devolucion.estDevolucion?.estadoDevolucion?.toLowerCase();
        if (estadoNombre !== filtros.estado.toLowerCase()) {
          return false;
        }
      }

      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const idDevolucion = `#DEV${String(devolucion.idDevolucion).padStart(3, '0')}`.toLowerCase();
        const idPedido = `#PED${String(devolucion.pedido?.idPedido || 0).padStart(3, '0')}`.toLowerCase();
        const idEntrega = `#ENT${String(devolucion.entrega?.idEntrega || 0).padStart(3, '0')}`.toLowerCase();
        
        if (!idDevolucion.includes(busqueda) && 
            !idPedido.includes(busqueda) && 
            !idEntrega.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });
  }, [devoluciones, filtros]);

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      busqueda: ''
    });
    setPaginaActual(1);
  };

  // Paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const devolucionesPaginadas = devolucionesFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(devolucionesFiltradas.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAprobar = async (idDevolucion) => {
    if (!window.confirm('¿Está seguro de aprobar esta devolución?')) return;
    
    try {
      setProcesando(idDevolucion);
      await devolucionService.aprobarDevolucion(idDevolucion);
      await cargarDevoluciones();
      alert('Devolución aprobada exitosamente');
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert(error.response?.data || 'Error al aprobar la devolución');
    } finally {
      setProcesando(null);
    }
  };

  const abrirModalRechazo = (idDevolucion) => {
    setModalRechazo({ mostrar: true, idDevolucion });
    setMotivoRechazo('');
  };

  const cerrarModalRechazo = () => {
    setModalRechazo({ mostrar: false, idDevolucion: null });
    setMotivoRechazo('');
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Por favor ingrese el motivo del rechazo');
      return;
    }
    
    try {
      setProcesando(modalRechazo.idDevolucion);
      await devolucionService.rechazarDevolucion(modalRechazo.idDevolucion, motivoRechazo);
      await cargarDevoluciones();
      cerrarModalRechazo();
      alert('Devolución rechazada exitosamente');
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert(error.response?.data || 'Error al rechazar la devolución');
    } finally {
      setProcesando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Completa': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Incompleta': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Con Daños': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const formatearFechaHora = (fecha, hora) => {
    if (!hora) return 'N/A';
    const fechaHora = new Date(hora);
    return fechaHora.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hayFiltrosActivos = filtros.estado || filtros.busqueda;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando devoluciones...</p>
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
              Gestión de Devoluciones
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Registra devoluciones directamente desde el detalle de cada entrega
            </p>
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
                    placeholder="Buscar por ID de devolución, pedido o entrega..."
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
                  <option value="completa">Completa</option>
                  <option value="incompleta">Incompleta</option>
                  <option value="con daños">Con Daños</option>
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
                Mostrando <span className="font-semibold">{devolucionesFiltradas.length}</span> de{' '}
                <span className="font-semibold">{devoluciones.length}</span> devoluciones
              </div>
            )}
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    ID Devolución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Pedido Asociado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Entrega
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {devolucionesPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {hayFiltrosActivos 
                        ? 'No se encontraron devoluciones con los filtros aplicados' 
                        : 'No hay devoluciones registradas'}
                    </td>
                  </tr>
                ) : (
                  devolucionesPaginadas.map((devolucion) => (
                    <tr key={devolucion.idDevolucion} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        #DEV{String(devolucion.idDevolucion).padStart(3, '0')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatearFechaHora(devolucion.fechaDevolucion, devolucion.horaDevolucion)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/pedidos/${devolucion.pedido?.idPedido}`)}
                          className="text-[rgb(44,171,91)] hover:underline"
                        >
                          #PED{String(devolucion.pedido?.idPedido || 0).padStart(3, '0')}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/entregas/${devolucion.entrega?.idEntrega}`)}
                          className="text-[rgb(44,171,91)] hover:underline"
                        >
                          #ENT{String(devolucion.entrega?.idEntrega || 0).padStart(3, '0')}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(devolucion.estDevolucion?.estadoDevolucion)}`}>
                          {devolucion.estDevolucion?.estadoDevolucion || 'Sin estado'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2">
                          {/* Mostrar botones Aprobar/Rechazar solo si está Pendiente */}
                          {devolucion.estDevolucion?.idEstDevolucion === 1 && (
                            <>
                              <button
                                onClick={() => handleAprobar(devolucion.idDevolucion)}
                                disabled={procesando === devolucion.idDevolucion || !devolucionesCompletas[devolucion.idDevolucion]}
                                className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!devolucionesCompletas[devolucion.idDevolucion] ? 'Faltan insumos por devolver' : ''}
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {procesando === devolucion.idDevolucion ? 'Procesando...' : 'Aprobar'}
                              </button>
                              <button
                                onClick={() => abrirModalRechazo(devolucion.idDevolucion)}
                                disabled={procesando === devolucion.idDevolucion}
                                className="flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                Rechazar
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => navigate(`/devoluciones/${devolucion.idDevolucion}`)}
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

          {/*Modal de rechazo*/}
          {modalRechazo.mostrar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Rechazar Devolución
                  </h3>
                  <button
                    onClick={cerrarModalRechazo}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo del rechazo *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows="4"
                    placeholder="Explique por qué rechaza esta devolución..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cerrarModalRechazo}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRechazar}
                    disabled={!motivoRechazo.trim() || procesando}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {procesando ? 'Rechazando...' : 'Confirmar Rechazo'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, devolucionesFiltradas.length)} de {devolucionesFiltradas.length} devoluciones
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

export default ListaDevoluciones;
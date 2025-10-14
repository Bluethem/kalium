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

  useEffect(() => {
    cargarDevoluciones();
  }, []);

  const cargarDevoluciones = async () => {
    try {
      setLoading(true);
      const response = await devolucionService.getDevoluciones();
      setDevoluciones(response.data);
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
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Devoluciones
            </h2>
            <button
              onClick={() => navigate('/devoluciones/nueva')}
              className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nueva Devolución
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
                {devolucionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {hayFiltrosActivos 
                        ? 'No se encontraron devoluciones con los filtros aplicados' 
                        : 'No hay devoluciones registradas'}
                    </td>
                  </tr>
                ) : (
                  devolucionesFiltradas.map((devolucion) => (
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
                        <button
                          onClick={() => navigate(`/devoluciones/${devolucion.idDevolucion}`)}
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
        </div>
      </main>
    </div>
  );
};

export default ListaDevoluciones;
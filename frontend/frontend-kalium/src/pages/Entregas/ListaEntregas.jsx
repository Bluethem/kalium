import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { entregaService } from '../../services/api';

const ListaEntregas = () => {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estudiante: '',
    pedido: '',
    busqueda: ''
  });

  useEffect(() => {
    cargarEntregas();
  }, []);

  const cargarEntregas = async () => {
    try {
      setLoading(true);
      const response = await entregaService.getEntregas();
      setEntregas(response.data);
    } catch (error) {
      console.error('Error al cargar entregas:', error);
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
        const nombreEstudiante = `${entrega.estudiante?.nombre || ''} ${entrega.estudiante?.apellido || ''}`.toLowerCase();
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

  const limpiarFiltros = () => {
    setFiltros({
      estudiante: '',
      pedido: '',
      busqueda: ''
    });
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
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Entregas
            </h2>
            <button
              onClick={() => navigate('/entregas/nueva')}
              className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Registrar Entrega
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
                {entregasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {hayFiltrosActivos 
                        ? 'No se encontraron entregas con los filtros aplicados' 
                        : 'No hay entregas registradas'}
                    </td>
                  </tr>
                ) : (
                  entregasFiltradas.map((entrega) => (
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
                        {entrega.estudiante?.nombre} {entrega.estudiante?.apellido}
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
        </div>
      </main>
    </div>
  );
};

export default ListaEntregas;
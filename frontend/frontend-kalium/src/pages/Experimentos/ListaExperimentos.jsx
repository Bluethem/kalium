import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { experimentoService } from '../../services/api';

const ListaExperimentos = () => {
  const navigate = useNavigate();
  const [experimentos, setExperimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarExperimentos();
  }, []);

  const cargarExperimentos = async () => {
    try {
      setLoading(true);
      const response = await experimentoService.getExperimentos();
      setExperimentos(response.data);
    } catch (error) {
      console.error('Error al cargar experimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const experimentosFiltrados = useMemo(() => {
    if (!busqueda) return experimentos;
    
    const busquedaLower = busqueda.toLowerCase();
    return experimentos.filter(exp => {
      const idExp = `EXP${String(exp.idExperimento).padStart(3, '0')}`.toLowerCase();
      const nombre = exp.nombreExperimento?.toLowerCase() || '';
      return idExp.includes(busquedaLower) || nombre.includes(busquedaLower);
    });
  }, [experimentos, busqueda]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2cab5b] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando experimentos...</p>
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Experimentos
            </h1>
            <button
              onClick={() => navigate('/experimentos/nuevo')}
              className="flex items-center gap-2 rounded-lg bg-[#2cab5b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo Experimento
            </button>
          </div>

          {/* Búsqueda */}
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ID o nombre de experimento..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14378f] focus:border-transparent"
              />
            </div>
            {busqueda && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-semibold">{experimentosFiltrados.length}</span> de{' '}
                <span className="font-semibold">{experimentos.length}</span> experimentos
              </div>
            )}
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Nombre del Experimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Insumos Necesarios
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {experimentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {busqueda 
                          ? 'No se encontraron experimentos con ese criterio de búsqueda' 
                          : 'No hay experimentos registrados'}
                      </td>
                    </tr>
                  ) : (
                    experimentosFiltrados.map((experimento) => (
                      <tr key={experimento.idExperimento} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                          EXP{String(experimento.idExperimento).padStart(3, '0')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {experimento.nombreExperimento}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {experimento.detalles?.length > 0 
                            ? `${experimento.detalles.length} insumo(s) necesario(s)`
                            : 'Sin insumos definidos'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => navigate(`/experimentos/${experimento.idExperimento}`)}
                            className="text-[#2cab5b] hover:underline font-medium"
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
        </div>
      </main>
    </div>
  );
};

export default ListaExperimentos;
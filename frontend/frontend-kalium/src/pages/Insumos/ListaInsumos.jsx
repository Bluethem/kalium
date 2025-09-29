import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { insumoService } from '../../services/api';
import Header from '../../components/Layout/Header';

const ListaInsumos = () => {
  const navigate = useNavigate();
  const [tiposInsumo, setTiposInsumo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarTiposInsumo();
  }, []);

  const cargarTiposInsumo = async () => {
    try {
      setLoading(true);
      const response = await insumoService.getTiposInsumo();
      setTiposInsumo(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar insumos: ' + (err.response?.data || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsumos = tiposInsumo.filter((insumo) =>
    insumo.nombreTipoInsumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14378f] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando insumos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con título y botón */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestionar Insumos
          </h2>
          <button
            onClick={() => navigate('/insumos/nuevo')}
            className="flex items-center gap-2 bg-[#14378f] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
          >
            <Plus size={20} />
            <span className="truncate">Agregar Insumo</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus:border-[#14378f] focus:ring-[#14378f] text-gray-900 dark:text-white"
              placeholder="Buscar insumos..."
            />
          </div>
        </div>

        {/* Tabla de insumos */}
        <div className="overflow-x-auto bg-[#f6f6f8] dark:bg-[#111621] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3" scope="col">
                  Nombre
                </th>
                <th className="px-6 py-3" scope="col">
                  Descripción
                </th>
                <th className="px-6 py-3" scope="col">
                  Categoría
                </th>
                <th className="px-6 py-3" scope="col">
                  Unidad
                </th>
                <th className="px-6 py-3 text-center" scope="col">
                  Detalles y Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredInsumos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron insumos
                  </td>
                </tr>
              ) : (
                filteredInsumos.map((insumo) => (
                  <tr
                    key={insumo.idTipoInsumo}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {insumo.nombreTipoInsumo}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {insumo.descripcion}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {insumo.categoria?.nombreCategoria || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {insumo.unidad?.unidad || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/insumos/${insumo.idTipoInsumo}`)}
                        className="flex items-center justify-center gap-2 w-full bg-[#14378f]/10 text-[#14378f] px-3 py-1.5 rounded-md font-medium hover:bg-[#14378f]/20 text-xs transition-all"
                      >
                        <span>Ver Detalles</span>
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ListaInsumos;

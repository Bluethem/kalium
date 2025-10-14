import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { experimentoService } from '../../services/api';

const DetalleExperimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experimento, setExperimento] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarExperimento();
  }, [id]);

  const cargarExperimento = async () => {
    try {
      setLoading(true);
      const [expResponse, detallesResponse] = await Promise.all([
        experimentoService.getExperimentoById(id),
        experimentoService.getDetallesExperimento(id)
      ]);
      setExperimento(expResponse.data);
      setDetalles(detallesResponse.data || []);
    } catch (error) {
      console.error('Error al cargar experimento:', error);
      alert('No se pudo cargar el experimento');
      navigate('/experimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await experimentoService.deleteExperimento(id);
      navigate('/experimentos');
    } catch (error) {
      console.error('Error al eliminar experimento:', error);
      alert('No se pudo eliminar el experimento');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2cab5b] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando experimento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!experimento) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Experimento no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/experimentos')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {experimento.nombreExperimento}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Experimento EXP{String(experimento.idExperimento).padStart(3, '0')}
              </p>
            </div>
            <button
              onClick={() => navigate(`/experimentos/${id}/editar`)}
              className="flex items-center gap-2 rounded-lg bg-[#2cab5b] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Editar
            </button>
            <button
              onClick={() => setShowModalEliminar(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Eliminar
            </button>
          </div>

          {/* Información del Experimento */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Información del Experimento
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    ID del Experimento
                  </p>
                  <p className="text-base font-semibold font-mono text-gray-900 dark:text-white">
                    EXP{String(experimento.idExperimento).padStart(3, '0')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nombre del Experimento
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {experimento.nombreExperimento}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total de Insumos Necesarios
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {detalles.length} insumo(s)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insumos Necesarios */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Insumos Necesarios
              </h3>
            </div>
            <div className="p-6">
              {detalles.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">science</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay insumos definidos para este experimento
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Insumo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Unidad
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Tipo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {detalles.map((detalle, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {detalle.tipoInsumo?.nombreTipoInsumo || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {detalle.tipoInsumo?.descripcion || 'Sin descripción'}
                          </td>
                          <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900 dark:text-white">
                            {detalle.cantInsumoExperimento}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                            {detalle.tipoInsumo?.unidad?.unidad || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              detalle.tipoInsumo?.esQuimico
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {detalle.tipoInsumo?.esQuimico ? 'Químico' : 'Insumo físico'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Botón volver */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/experimentos')}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Volver a Experimentos
            </button>
          </div>
        </div>
      </main>

      {/* Modal Confirmar Eliminar */}
      {showModalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
                  delete
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Eliminar Experimento
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro de eliminar este experimento? Esta acción no se puede deshacer y eliminará todos los insumos asociados.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModalEliminar(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleExperimento;
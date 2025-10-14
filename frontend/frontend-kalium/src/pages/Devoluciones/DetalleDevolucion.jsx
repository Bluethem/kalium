import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { devolucionService } from '../../services/api';

const DetalleDevolucion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devolucion, setDevolucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarDevolucion();
  }, [id]);

  const cargarDevolucion = async () => {
    try {
      setLoading(true);
      const response = await devolucionService.getDevolucionById(id);
      setDevolucion(response.data);
    } catch (error) {
      console.error('Error al cargar devolución:', error);
      alert('No se pudo cargar la devolución');
      navigate('/devoluciones');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await devolucionService.deleteDevolucion(id);
      navigate('/devoluciones');
    } catch (error) {
      console.error('Error al eliminar devolución:', error);
      alert('No se pudo eliminar la devolución');
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando detalle de la devolución...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!devolucion) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Devolución no encontrada</p>
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
              onClick={() => navigate('/devoluciones')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Detalle de Devolución #DEV{String(devolucion.idDevolucion).padStart(3, '0')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Información completa de la devolución
              </p>
            </div>
            <button
              onClick={() => setShowModalEliminar(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Eliminar
            </button>
          </div>

          {/* Información General */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Información General
                </h3>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getEstadoBadge(devolucion.estDevolucion?.estadoDevolucion)}`}>
                  {devolucion.estDevolucion?.estadoDevolucion || 'Sin estado'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fecha de Devolución
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {devolucion.fechaDevolucion ? new Date(devolucion.fechaDevolucion).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Hora de Devolución
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {devolucion.horaDevolucion ? new Date(devolucion.horaDevolucion).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Pedido Asociado
                  </p>
                  <button
                    onClick={() => navigate(`/pedidos/${devolucion.pedido?.idPedido}`)}
                    className="text-base font-semibold text-[rgb(44,171,91)] hover:underline"
                  >
                    #PED{String(devolucion.pedido?.idPedido || 0).padStart(3, '0')}
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Entrega Asociada
                  </p>
                  <button
                    onClick={() => navigate(`/entregas/${devolucion.entrega?.idEntrega}`)}
                    className="text-base font-semibold text-[rgb(44,171,91)] hover:underline"
                  >
                    #ENT{String(devolucion.entrega?.idEntrega || 0).padStart(3, '0')}
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Estado
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {devolucion.estDevolucion?.estadoDevolucion || 'Sin estado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón volver */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/devoluciones')}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Volver a Devoluciones
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
                Eliminar Devolución
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro de eliminar esta devolución? Esta acción no se puede deshacer.
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

export default DetalleDevolucion;
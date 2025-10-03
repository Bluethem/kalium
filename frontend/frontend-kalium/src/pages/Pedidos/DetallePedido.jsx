import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { pedidoService } from '../../services/api';

const DetallePedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalAprobar, setShowModalAprobar] = useState(false);
  const [showModalRechazar, setShowModalRechazar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [accionRealizada, setAccionRealizada] = useState('');

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    try {
      setLoading(true);
      const [pedidoRes, detallesRes] = await Promise.all([
        pedidoService.getPedidoById(id),
        pedidoService.getDetallesPedido(id)
      ]);
      setPedido(pedidoRes.data);
      setDetalles(detallesRes.data);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      alert('No se pudo cargar el pedido');
      navigate('/pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    try {
      await pedidoService.cambiarEstado(id, 2); // Asumiendo 2 = Aprobado
      setShowModalAprobar(false);
      setAccionRealizada('aprobado');
      setShowSuccess(true);
      await cargarPedido();
    } catch (error) {
      console.error('Error al aprobar pedido:', error);
      alert('No se pudo aprobar el pedido');
    }
  };

  const handleRechazar = async () => {
    try {
      await pedidoService.cambiarEstado(id, 3); // Asumiendo 3 = Rechazado
      setShowModalRechazar(false);
      setAccionRealizada('rechazado');
      setShowSuccess(true);
      await cargarPedido();
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando detalle del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Pedido no encontrado</p>
        </div>
      </div>
    );
  }

  const esPendiente = pedido.estPedido?.nombreEstPedido === 'Pendiente';

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header con botón volver */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/pedidos')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Detalle del Pedido #{String(pedido.idPedido).padStart(5, '0')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Información completa del pedido y sus insumos
              </p>
            </div>
          </div>

          {/* Card de información del pedido */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Información del Pedido
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getEstadoBadge(pedido.estPedido?.nombreEstPedido)}`}>
                      {pedido.estPedido?.nombreEstPedido || 'Sin estado'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {pedido.tipoPedido?.nombrePedido || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Botones de acción si está pendiente */}
                {esPendiente && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModalAprobar(true)}
                      className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Aprobar Pedido
                    </button>
                    <button
                      onClick={() => setShowModalRechazar(true)}
                      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      Rechazar Pedido
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del pedido en grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fecha del Pedido
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Instructor
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {pedido.instructor?.usuario?.nombre} {pedido.instructor?.usuario?.apellido}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Curso
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {pedido.curso?.nombreCurso || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Cantidad de Grupos
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {pedido.cantGrupos}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Horario de Entrega
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {pedido.horario?.fechaEntrega ? new Date(pedido.horario.fechaEntrega).toLocaleDateString('es-ES') : 'N/A'}
                    {' - '}
                    {pedido.horario?.horaInicio ? new Date(pedido.horario.horaInicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tipo de Pedido
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {pedido.tipoPedido?.nombrePedido || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de insumos solicitados */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Insumos Solicitados
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Listado de materiales y químicos requeridos para este pedido
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Insumo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Unidad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {detalles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay insumos en este pedido
                      </td>
                    </tr>
                  ) : (
                    detalles.map((detalle, index) => (
                      <tr key={detalle.idPedidoDetalle} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {detalle.tipoInsumo?.nombreTipoInsumo || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {detalle.tipoInsumo?.categoria?.nombreCategoria || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {detalle.tipoInsumo?.esQuimico ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              Químico
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Físico
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {detalle.cantInsumo}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {detalle.tipoInsumo?.unidad?.unidad || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen */}
            {detalles.length > 0 && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total de ítems:
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {detalles.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botón volver */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/pedidos')}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Volver a Pedidos
            </button>
          </div>
        </div>
      </main>

      {/* Modal Confirmar Aprobar */}
      {showModalAprobar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">
                  check_circle
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Aprobar Pedido
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro que desea aprobar el pedido #{String(pedido.idPedido).padStart(5, '0')}? Esta acción notificará al instructor.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModalAprobar(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAprobar}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Rechazar */}
      {showModalRechazar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
                  cancel
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Rechazar Pedido
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro que desea rechazar el pedido #{String(pedido.idPedido).padStart(5, '0')}? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModalRechazar(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                  check
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Pedido {accionRealizada === 'aprobado' ? 'Aprobado' : 'Rechazado'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                El pedido ha sido {accionRealizada} exitosamente.
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setAccionRealizada('');
                }}
                className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePedido;
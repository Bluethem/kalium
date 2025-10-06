import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { pedidoService } from '../../services/api';

const MisPedidosInstructor = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructorActual, setInstructorActual] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    curso: '',
    tipoPedido: ''
  });

  useEffect(() => {
    cargarPedidosInstructor();
  }, []);

  const cargarPedidosInstructor = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario en sesión
      const usuario = localStorage.getItem('usuario');
      if (!usuario) {
        alert('No se encontró sesión activa');
        navigate('/login');
        return;
      }
      
      const parsed = JSON.parse(usuario);
      
      // Cargar todos los pedidos
      const response = await pedidoService.getPedidos();
      
      // Filtrar solo los pedidos del instructor actual
      const pedidosDelInstructor = (response.data || []).filter(
        pedido => pedido.instructor?.usuario?.idUsuario === parsed.idUsuario
      );
      
      setPedidos(pedidosDelInstructor);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (idPedido) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido?')) return;
    
    try {
      await pedidoService.deletePedido(idPedido);
      alert('Pedido eliminado correctamente');
      cargarPedidosInstructor();
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      alert('No se pudo eliminar el pedido');
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Cancelado': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      'En Preparación': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Entregado': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const renderAcciones = (pedido) => {
    const estadoPedido = pedido.estPedido?.nombreEstPedido;
    
    // Si el pedido está PENDIENTE: Ver, Editar, Eliminar
    if (estadoPedido === 'Pendiente') {
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/pedidos/${pedido.idPedido}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Ver detalles"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
          </button>
          <button
            onClick={() => navigate(`/pedidos/editar/${pedido.idPedido}`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            title="Editar"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
          <button
            onClick={() => handleEliminar(pedido.idPedido)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      );
    }
    
    // Para todos los demás estados (Aprobado, En Preparación, Entregado, Cancelado): solo Ver
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={() => navigate(`/pedidos/${pedido.idPedido}`)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          title="Ver detalles"
        >
          <span className="material-symbols-outlined text-base">visibility</span>
        </button>
      </div>
    );
  };

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
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Mis Pedidos
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ver, editar o eliminar mis solicitudes de insumos
              </p>
            </div>
            <button
              onClick={() => navigate('/pedidos/nuevo')}
              className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Crear Pedido
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="En Preparación">En Preparación</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    N° Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No tienes pedidos registrados
                    </td>
                  </tr>
                ) : (
                  pedidos
                    .filter(pedido => !filtros.estado || pedido.estPedido?.nombreEstPedido === filtros.estado)
                    .map((pedido) => (
                      <tr key={pedido.idPedido} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          #{String(pedido.idPedido).padStart(5, '0')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pedido.curso?.nombreCurso || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pedido.tipoPedido?.nombrePedido || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(pedido.estPedido?.nombreEstPedido)}`}>
                            {pedido.estPedido?.nombreEstPedido || 'Sin estado'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                          {renderAcciones(pedido)}
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

export default MisPedidosInstructor;

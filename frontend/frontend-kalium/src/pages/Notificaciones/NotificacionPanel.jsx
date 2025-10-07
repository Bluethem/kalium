import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ AGREGAR
import { notificacionService } from '../../services/api';

const NotificacionPanel = ({ isOpen, onClose, idUsuario }) => {
  const navigate = useNavigate(); // ✅ AGREGAR
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen && idUsuario) {
      cargarNotificaciones();
    }
  }, [isOpen, idUsuario]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const [respNotif, respResumen] = await Promise.all([
        notificacionService.getNotificacionesNoLeidas(idUsuario),
        notificacionService.getResumen(idUsuario)
      ]);
      setNotificaciones(respNotif.data);
      setResumen(respResumen.data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (idNotificacion) => {
    try {
      await notificacionService.marcarComoLeida(idNotificacion);
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas(idUsuario);
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar todas:', error);
    }
  };

  const handleEliminar = async (idNotificacion) => {
    try {
      await notificacionService.eliminarNotificacion(idNotificacion);
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const handleVerTodas = () => {
    navigate('/notificaciones');
    onClose();
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      'BAJO_STOCK': 'inventory_2',
      'PEDIDO_PENDIENTE': 'pending_actions',
      'INCIDENTE': 'warning',
    };
    return iconos[tipo] || 'notifications';
  };

  const getColorTipo = (tipo) => {
    const colores = {
      'BAJO_STOCK': 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      'PEDIDO_PENDIENTE': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      'INCIDENTE': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    };
    return colores[tipo] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - date) / 1000); // segundos

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 max-h-[32rem] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </h3>
          {notificaciones.length > 0 && (
            <button
              onClick={handleMarcarTodasLeidas}
              className="text-xs text-[rgb(44,171,91)] hover:underline"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        
        {/* Resumen */}
        {resumen && resumen.totalNoLeidas > 0 && (
          <div className="mt-2 flex gap-2 text-xs">
            {resumen.totalBajoStock > 0 && (
              <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {resumen.totalBajoStock} stock bajo
              </span>
            )}
            {resumen.totalPedidosPendientes > 0 && (
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {resumen.totalPedidosPendientes} pedidos
              </span>
            )}
            {resumen.totalIncidentes > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {resumen.totalIncidentes} incidentes
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="max-h-[24rem] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(44,171,91)]"></div>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
            <p className="text-sm">No tienes notificaciones nuevas</p>
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div
              key={notif.idNotificacion}
              className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex gap-3">
                {/* Icono */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorTipo(notif.tipo)}`}>
                  <span className="material-symbols-outlined text-lg">
                    {getIconoTipo(notif.tipo)}
                  </span>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notif.titulo}
                    </p>
                    <button
                      onClick={() => handleEliminar(notif.idNotificacion)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {notif.mensaje}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatearFecha(notif.fechaCreacion)}
                    </span>
                    <button
                      onClick={() => handleMarcarLeida(notif.idNotificacion)}
                      className="text-xs text-[rgb(44,171,91)] hover:underline"
                    >
                      Marcar leída
                    </button>
                    <button
                      onClick={handleVerTodas}
                      className="text-sm text-[rgb(44,171,91)] hover:underline font-medium"
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notificaciones.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
          <button
            onClick={() => {/* TODO: Navegar a página de notificaciones */}}
            className="text-sm text-[rgb(44,171,91)] hover:underline"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
      {notificaciones.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
          <button
            onClick={handleVerTodas} // ✅ ACTUALIZAR
            className="text-sm text-[rgb(44,171,91)] hover:underline font-medium"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificacionPanel;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificacionService } from '../../services/api';

const ListaNotificaciones = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  
  // Filtros y tabs
  const [tabActual, setTabActual] = useState('todas'); // 'todas', 'no-leidas', 'archivadas'
  const [filtroTipo, setFiltroTipo] = useState(''); // '', 'BAJO_STOCK', 'PEDIDO_PENDIENTE', etc.
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const parsed = JSON.parse(usuario);
      setUserId(parsed?.idUsuario);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      cargarNotificaciones();
    }
  }, [userId, tabActual]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener rol del usuario
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const rolNombre = usuario?.rol?.nombreRol || usuario?.rol;
      
      let response;
      if (tabActual === 'no-leidas') {
        response = await notificacionService.getNotificacionesNoLeidas(userId);
      } else {
        response = await notificacionService.getNotificacionesPorUsuario(userId);
      }
      
      let notifs = response.data || [];
      
      // ✅ Filtrar según el rol
      notifs = filtrarPorRol(notifs, rolNombre);
      
      // Filtrar por tipo si hay filtro activo
      if (filtroTipo) {
        notifs = notifs.filter(n => n.tipo === filtroTipo);
      }
      
      setNotificaciones(notifs);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Nueva función para filtrar por rol
  const filtrarPorRol = (notificaciones, rol) => {
    if (rol === 'ADMIN_SISTEMA') {
      // ADMIN_SISTEMA solo ve notificaciones de usuarios y solicitudes
      return notificaciones.filter(n => 
        n.tipo === 'SOLICITUD_REGISTRO' ||
        n.tipo === 'NUEVO_USUARIO' ||
        n.tipo === 'CAMBIO_ROL'
      );
    } else if (rol === 'ESTUDIANTE' || rol === 'Estudiante') {
      // ESTUDIANTE solo ve entregas, devoluciones e incidentes
      return notificaciones.filter(n =>
        n.tipo === 'ENTREGA_DISPONIBLE' ||
        n.tipo === 'DEVOLUCION_PROCESADA' ||
        n.tipo === 'DEVOLUCION_PENDIENTE' ||
        n.tipo === 'INCIDENTE_ACTUALIZADO' ||
        n.tipo === 'INCIDENTE'
      );
    } else {
      // ADMIN, ADMIN_LABORATORIO, INSTRUCTOR ven todo
      return notificaciones;
    }
  };

  const getTiposPorRol = (rol) => {
    if (rol === 'ADMIN_SISTEMA') {
      return [
        { value: '', label: 'Todos' },
        { value: 'SOLICITUD_REGISTRO', label: 'Solicitudes' },
        { value: 'NUEVO_USUARIO', label: 'Nuevos Usuarios' },
        { value: 'CAMBIO_ROL', label: 'Cambios de Rol' },
      ];
    } else if (rol === 'ESTUDIANTE' || rol === 'Estudiante') {
      return [
        { value: '', label: 'Todos' },
        { value: 'ENTREGA_DISPONIBLE', label: 'Entregas' },
        { value: 'DEVOLUCION_PROCESADA', label: 'Devoluciones Procesadas' },
        { value: 'DEVOLUCION_PENDIENTE', label: 'Devoluciones Pendientes' },
        { value: 'INCIDENTE_ACTUALIZADO', label: 'Incidentes Actualizados' },
        { value: 'INCIDENTE', label: 'Incidentes' },
      ];
    } else {
      return [
        { value: '', label: 'Todos' },
        { value: 'BAJO_STOCK', label: 'Bajo Stock' },
        { value: 'PEDIDO_PENDIENTE', label: 'Pedidos Pendientes' },
        { value: 'PEDIDO_APROBADO', label: 'Pedidos Aprobados' },
        { value: 'INCIDENTE', label: 'Incidentes' },
        { value: 'DEVOLUCION_PENDIENTE', label: 'Devoluciones' },
      ];
    }
  };

  const handleMarcarLeida = async (idNotificacion) => {
    try {
      await notificacionService.marcarComoLeida(idNotificacion);
      cargarNotificaciones();
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const handleEliminar = async (idNotificacion) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;
    
    try {
      await notificacionService.eliminarNotificacion(idNotificacion);
      cargarNotificaciones();
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas(userId);
      cargarNotificaciones();
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const handleLimpiarLeidas = async () => {
    if (!confirm('¿Eliminar todas las notificaciones leídas?')) return;
    
    try {
      await notificacionService.limpiarLeidas(userId);
      cargarNotificaciones();
    } catch (err) {
      console.error('Error al limpiar notificaciones:', err);
    }
  };

  // Función para obtener el icono según el tipo
  const getIcono = (tipo) => {
    switch (tipo) {
      case 'BAJO_STOCK':
        return { icono: 'warning', color: 'yellow' };
      case 'PEDIDO_PENDIENTE':
        return { icono: 'schedule', color: 'blue' };
      case 'PEDIDO_APROBADO':
        return { icono: 'check_circle', color: 'green' };
      case 'PEDIDO_RECHAZADO':
        return { icono: 'cancel', color: 'red' };
      case 'INCIDENTE':
      case 'INCIDENTE_ACTUALIZADO':
        return { icono: 'error', color: 'red' };
      case 'SOLICITUD_REGISTRO':
        return { icono: 'person_add', color: 'blue' };
      case 'NUEVO_USUARIO':
        return { icono: 'group_add', color: 'green' };
      case 'CAMBIO_ROL':
        return { icono: 'admin_panel_settings', color: 'purple' };
      case 'ENTREGA_DISPONIBLE':
        return { icono: 'local_shipping', color: 'blue' };
      case 'DEVOLUCION_PROCESADA':
      case 'DEVOLUCION_PENDIENTE':
        return { icono: 'assignment_return', color: 'orange' };
      default:
        return { icono: 'info', color: 'gray' };
    }
  };

  // Función para formatear la fecha relativa
  const formatearFechaRelativa = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora - fechaNotif;
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `Hace ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return fechaNotif.toLocaleDateString('es-ES');
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones;

  // Paginación
  const indiceUltimo = paginaActual * itemsPorPagina;
  const indicePrimero = indiceUltimo - itemsPorPagina;
  const notificacionesPaginadas = notificaciones.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(notificaciones.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Gestiona tus notificaciones y mantente al tanto de las actualizaciones importantes.
            </p>
          </header>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav aria-label="Tabs" className="flex space-x-8">
              <button
                onClick={() => { setTabActual('todas'); setPaginaActual(1); }}
                className={`border-b-2 px-1 py-3 text-sm font-semibold ${
                  tabActual === 'todas'
                    ? 'border-[rgb(44,171,91)] text-[rgb(44,171,91)]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => { setTabActual('no-leidas'); setPaginaActual(1); }}
                className={`border-b-2 px-1 py-3 text-sm font-semibold ${
                  tabActual === 'no-leidas'
                    ? 'border-[rgb(44,171,91)] text-[rgb(44,171,91)]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                No leídas
              </button>
            </nav>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {/* Filtro por tipo */}
              <select
                value={filtroTipo}
                onChange={(e) => { setFiltroTipo(e.target.value); setPaginaActual(1); }}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              >
                {(() => {
                  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
                  const rolNombre = usuario?.rol?.nombreRol || usuario?.rol;
                  const tiposDisponibles = getTiposPorRol(rolNombre);
                  
                  return tiposDisponibles.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMarcarTodasLeidas}
                className="px-4 py-2 bg-[rgb(44,171,91)] text-white rounded-lg text-sm font-medium hover:bg-[rgb(38,148,79)] transition-colors"
              >
                Marcar todas como leídas
              </button>
              <button
                onClick={handleLimpiarLeidas}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Limpiar leídas
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          ) : notificacionesPaginadas.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">notifications_off</span>
              <p className="text-gray-500 dark:text-gray-400">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificacionesPaginadas.map((notif) => {
                const { icono, color } = getIcono(notif.tipo);
                return (
                  <div
                    key={notif.idNotificacion}
                    className={`flex items-start gap-4 p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border ${
                      notif.leida
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {/* Icono */}
                    <div className={`flex-shrink-0 size-12 flex items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900/50`}>
                      <span className={`material-symbols-outlined text-${color}-600 dark:text-${color}-400`}>
                        {icono}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{notif.titulo}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.mensaje}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                          {formatearFechaRelativa(notif.fechaCreacion)}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-3 mt-3">
                        {!notif.leida && (
                          <button
                            onClick={() => handleMarcarLeida(notif.idNotificacion)}
                            className="text-xs text-[rgb(44,171,91)] hover:underline font-medium"
                          >
                            Marcar como leída
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminar(notif.idNotificacion)}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center pt-8 gap-1">
              <button
                onClick={() => cambiarPagina(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="inline-flex items-center justify-center size-10 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {[...Array(totalPaginas)].map((_, index) => {
                const numeroPagina = index + 1;
                // Mostrar solo páginas cercanas
                if (
                  numeroPagina === 1 ||
                  numeroPagina === totalPaginas ||
                  (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                ) {
                  return (
                    <button
                      key={numeroPagina}
                      onClick={() => cambiarPagina(numeroPagina)}
                      className={`inline-flex items-center justify-center size-10 rounded-full text-sm font-medium ${
                        paginaActual === numeroPagina
                          ? 'bg-[rgb(44,171,91)] text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  );
                } else if (
                  numeroPagina === paginaActual - 2 ||
                  numeroPagina === paginaActual + 2
                ) {
                  return (
                    <span key={numeroPagina} className="inline-flex items-center justify-center size-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => cambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="inline-flex items-center justify-center size-10 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          )}
        </div>
    </>
  );
};

export default ListaNotificaciones;
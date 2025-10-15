import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notificacionService } from '../../services/api';
import NotificacionPanel from '../../pages/Notificaciones/NotificacionPanel';
import websocketService from '../../services/websocket';
import { ToastContainer } from '../Toast';
import logger from '../../utils/logger';

const Header = ({ minimal = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem('usuario');
      if (u) {
        const parsed = JSON.parse(u);
        setUserEmail(parsed?.correo || '');
        setUserId(parsed?.idUsuario || null);
        // Obtener rol (objeto o string)
        const rolNombre = parsed?.rol?.nombreRol || parsed?.rol;
        setUserRole(rolNombre);
      }
    } catch {
      setUserEmail('');
      setUserId(null);
      setUserRole(null);
    }
  }, [location.pathname]);

  // ✅ Conectar WebSocket y cargar datos cuando el usuario está autenticado
  useEffect(() => {
    if (userId) {
      cargarContadorNotificaciones();
      
      // ✅ Conectar WebSocket
      websocketService.connect(userId, {
        onConnect: () => {
          logger.log('✅ WebSocket conectado en Header');
          setWsConnected(true);
          addToast('Conectado', 'Notificaciones en tiempo real activadas', 'success');
        },
        
        onNotificacion: (notificacion) => {
          logger.log('📬 Nueva notificación recibida:', notificacion);
          
          addToast(
            notificacion.titulo || 'Nueva notificación',
            notificacion.mensaje,
            'notification'
          );
          
          playNotificationSound();
          
          cargarContadorNotificaciones();
        },
        
        onContadorActualizado: (nuevoContador) => {
          logger.log('🔢 Contador actualizado:', nuevoContador);
          setContadorNoLeidas(nuevoContador);
        },
        
        onDisconnect: () => {
          logger.log('❌ WebSocket desconectado');
          setWsConnected(false);
        },
        
        onError: (error) => {
          logger.error('❌ Error WebSocket:', error);
        }
      });
      
      return () => {
        websocketService.disconnect();
      };
    }
  }, [userId]);

  const cargarContadorNotificaciones = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await notificacionService.getContadorNoLeidas(userId);
      setContadorNoLeidas(response.data);
    } catch (error) {
      logger.error('Error al cargar contador:', error);
    }
  }, [userId]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => logger.log('No se pudo reproducir el sonido'));
    } catch (e) {
      // Silencioso si falla
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // ✅ Renderizar menú según el ROL
  const renderNavMenu = () => {
    const role = userRole?.toUpperCase();

    // ESTUDIANTE: Menú a la izquierda
    if (role === 'ESTUDIANTE' || role === 'ESTUDIANTE') {
      return (
        <Link to="/dashboard-estudiante" className={`ml-8 text-sm font-medium hover:text-[#34D399] transition-colors ${isActive('/dashboard-estudiante') ? 'text-[#34D399] border-b-2 border-[#34D399] pb-1' : 'text-gray-600 dark:text-gray-300'}`}>
          Mi Dashboard
        </Link>
      );
    }

    // INSTRUCTOR: Menú específico (cuando se implemente)
    if (role === 'INSTRUCTOR') {
      return (
        <nav className="flex flex-1 justify-center items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link to="/dashboard-instructor" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/dashboard-instructor') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
            Dashboard
          </Link>
          <Link to="/pedidos" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/pedidos') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
            Pedidos
          </Link>
          <Link to="/insumos" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/insumos') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
            Insumos
          </Link>
        </nav>
      );
    }

    // ADMIN: Menú completo (por defecto)
    return (
      <nav className="flex flex-1 justify-center items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
        <Link to="/dashboard" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/dashboard') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Dashboard
        </Link>
        <Link to="/usuarios" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/usuarios') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Usuarios
        </Link>
        <Link to="/insumos" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/insumos') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Insumos
        </Link>
        <Link to="/pedidos" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/pedidos') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Pedidos
        </Link>
        <Link to="/incidentes" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/incidentes') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Incidentes
        </Link>
        <Link to="/reportes" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/reportes') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Reportes
        </Link>
        <Link to="/entregas" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/entregas') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Entregas
        </Link>
        <Link to="/devoluciones" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/devoluciones') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Devoluciones
        </Link>
        <Link to="/experimentos" className={`hover:text-[rgb(44,171,91)] transition-colors ${isActive('/experimentos') ? 'text-[rgb(44,171,91)] font-bold' : ''}`}>
          Experimentos
        </Link>
      </nav>
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-800 px-10 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4 text-gray-900 dark:text-white">
          <div className="size-6">
            <img src="/logo.png" alt="Kalium" className="h-6 w-6 object-contain" />
          </div>
          <h1 className="text-xl font-bold">Kalium</h1>
          {/* ✅ Menú de Estudiante va al lado del logo */}
          {!minimal && userRole?.toUpperCase() === 'ESTUDIANTE' && renderNavMenu()}
        </div>

        {/* ✅ Menú de Admin/Instructor va centrado */}
        {!minimal && userRole?.toUpperCase() !== 'ESTUDIANTE' && renderNavMenu()}

        {!minimal && (
          <div className="relative flex items-center gap-4">
            {wsConnected && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined text-sm animate-pulse">wifi</span>
                <span className="hidden sm:inline">En vivo</span>
              </div>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {contadorNoLeidas > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                    {contadorNoLeidas > 9 ? '9+' : contadorNoLeidas}
                  </span>
                )}
              </button>
              <NotificacionPanel 
                isOpen={notifOpen} 
                onClose={() => setNotifOpen(false)} 
                idUsuario={userId}
                onNotificacionActualizada={cargarContadorNotificaciones}
              />
            </div>

            {userEmail && (
              <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">{userEmail}</span>
            )}
            
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="size-10 rounded-full bg-[rgb(44,171,91)] text-white flex items-center justify-center font-bold"
            >
              {(userEmail || 'u').charAt(0).toUpperCase()}
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50">
                {userEmail && <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b truncate">{userEmail}</div>}
                <button onClick={() => { setMenuOpen(false); navigate('/cuenta'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">account_circle</span>
                  Mi cuenta
                </button>
                <button onClick={() => { localStorage.removeItem('usuario'); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">logout</span>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
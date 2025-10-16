import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notificacionService } from '../../services/api';
import NotificacionPanel from '../../pages/Notificaciones/NotificacionPanel';

const Header = ({ minimal = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);

  useEffect(() => {
    try {
      const u = localStorage.getItem('usuario');
      if (u) {
        const parsed = JSON.parse(u);
        setUserEmail(parsed?.correo || '');
        setUserId(parsed?.idUsuario || null);
      }
    } catch {
      setUserEmail('');
      setUserId(null);
    }
  }, [location.pathname]);

  const cargarContadorNotificaciones = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await notificacionService.getContadorNoLeidas(userId);
      setContadorNoLeidas(response.data);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      cargarContadorNotificaciones();
      const interval = setInterval(cargarContadorNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, cargarContadorNotificaciones]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-800 px-10 py-3 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4 text-gray-900 dark:text-white">
        <div className="size-6">
          <img src="/logo.png" alt="Kalium" className="h-6 w-6 object-contain" />
        </div>
        <h1 className="text-xl font-bold">Kalium</h1>
      </div>

      {!minimal && (
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
          {/* ✅ NUEVO ENLACE DE INCIDENTES */}
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
      )}

      {!minimal && (
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
              {contadorNoLeidas > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
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
  );
};

export default Header;
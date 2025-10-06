import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ minimal = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');

  useEffect(() => {
    // Cargar correo y detectar tipo de usuario desde localStorage
    try {
      const u = localStorage.getItem('usuario');
      if (u) {
        const parsed = JSON.parse(u);
        setUserEmail(parsed?.correo || '');
        
        // Detectar tipo de usuario basado en la ruta actual o localStorage
        if (location.pathname.includes('dashboard-instructor') || 
            location.pathname.includes('pedidos-instructor') ||
            location.pathname.includes('pedidos/nuevo')) {
          setTipoUsuario('instructor');
        } else {
          setTipoUsuario('administrador');
        }
      } else {
        setUserEmail('');
        setTipoUsuario('');
      }
    } catch {
      setUserEmail('');
      setTipoUsuario('');
    }
  }, [location.pathname]);

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
          {tipoUsuario === 'instructor' ? (
            // Navegación para Instructores
            <>
              <Link
                to="/dashboard-instructor"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/dashboard-instructor') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/pedidos-instructor"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/pedidos-instructor') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Mis Pedidos
              </Link>
              <Link
                to="/pedidos/nuevo"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/pedidos/nuevo') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Crear Pedido
              </Link>
            </>
          ) : (
            // Navegación para Administradores
            <>
              <Link
                to="/dashboard"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/dashboard') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/usuarios"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/usuarios') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Usuarios
              </Link>
              <Link
                to="/insumos"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/insumos') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Insumos
              </Link>
              <Link
                to="/pedidos"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/pedidos') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Pedidos
              </Link>
              <Link
                to="/reportes"
                className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
                  isActive('/reportes') ? 'text-[rgb(44,171,91)] font-bold' : ''
                }`}
              >
                Reportes
              </Link>
            </>
          )}
        </nav>
      )}

      {!minimal && (
        <div className="relative flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {userEmail && (
            <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">{userEmail}</span>
          )}
          <button
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="size-10 rounded-full bg-[rgb(44,171,91)] text-white flex items-center justify-center font-bold ring-0 focus:outline-none focus:ring-2 focus:ring-[rgb(44,171,91)]"
            title="Menú de usuario"
          >
            {(userEmail || 'u').charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50">
              {userEmail && (
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 truncate" title={userEmail}>{userEmail}</div>
              )}
              <button
                onClick={() => { setMenuOpen(false); navigate('/cuenta'); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">account_circle</span>
                Mi cuenta
              </button>
              <button
                onClick={() => { localStorage.removeItem('usuario'); setMenuOpen(false); navigate('/login'); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
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
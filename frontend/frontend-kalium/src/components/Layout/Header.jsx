import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-800 px-10 py-3 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4 text-gray-900 dark:text-white">
        <div className="size-6">
            <img src="../../public/logo.png" alt="logo" className="h-6 w-6 object-contain" />
          </div>
        <h1 className="text-xl font-bold">Kalium</h1>
      </div>

      <nav className="flex flex-1 justify-center items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
        <Link
          to="/"
          className={`hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors ${
            isActive('/') && location.pathname === '/' ? 'text-[rgb(44,171,91)] font-bold' : ''
          }`}
        >
          Dashboard
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
      </nav>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div
          className="size-10 rounded-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://ui-avatars.com/api/?name=Usuario&background=14378f&color=fff")',
          }}
        />
      </div>
    </header>
  );
};

export default Header;
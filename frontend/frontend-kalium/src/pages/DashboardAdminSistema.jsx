import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DashboardAdminSistema() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    totalUsuarios: 0,
    usuariosActivos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('resumen'); // 'resumen', 'solicitudes', 'usuarios'

  useEffect(() => {
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
      const parsed = JSON.parse(usuarioStorage);
      setUsuario(parsed);
      cargarEstadisticas();
    }
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      // Cargar solicitudes
      const solicitudesRes = await axios.get('http://localhost:8080/api/solicitudes');
      const solicitudes = solicitudesRes.data || [];
      
      // Cargar usuarios
      const usuariosRes = await axios.get('http://localhost:8080/api/usuarios');
      const usuarios = usuariosRes.data || [];
      
      setEstadisticas({
        totalSolicitudes: solicitudes.length,
        solicitudesPendientes: solicitudes.filter(s => !s.aprobado && !s.rechazado).length,
        totalUsuarios: usuarios.length,
        usuariosActivos: usuarios.filter(u => u.activo).length,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34D399] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Administrador de Sistema
        </h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          Bienvenido de nuevo, {usuario?.nombre || 'Administrador'}.
        </p>
      </div>

      {/* Navegación de pestañas */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setVistaActual('resumen')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              vistaActual === 'resumen'
                ? 'bg-[#34D399] text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => navigate('/solicitudes')}
            className="px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Solicitudes
          </button>
          <button
            onClick={() => navigate('/usuarios')}
            className="px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Usuarios
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/solicitudes')}
            className="bg-[#34D399] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2ab885] flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Ver Solicitudes
          </button>
          <button
            onClick={() => navigate('/usuarios')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Gestionar Usuarios
          </button>
        </div>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Solicitudes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Solicitudes
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
              {estadisticas.totalSolicitudes}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">
              assignment
            </span>
          </div>
        </div>

        {/* Solicitudes Pendientes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Solicitudes Pendientes
            </p>
            <p className="text-4xl font-bold text-yellow-500 dark:text-yellow-400 mt-1">
              {estadisticas.solicitudesPendientes}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-yellow-500 dark:text-yellow-400">
              hourglass_empty
            </span>
          </div>
        </div>

        {/* Total Usuarios */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Usuarios
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
              {estadisticas.totalUsuarios}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 dark:text-green-400">
              people
            </span>
          </div>
        </div>

        {/* Usuarios Activos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Usuarios Activos
            </p>
            <p className="text-4xl font-bold text-green-500 dark:text-green-400 mt-1">
              {estadisticas.usuariosActivos}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 dark:text-green-400">
              person_outline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdminSistema;
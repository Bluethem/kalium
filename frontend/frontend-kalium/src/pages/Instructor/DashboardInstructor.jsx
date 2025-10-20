import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const DashboardInstructor = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const usuarioStorage = localStorage.getItem('usuario');
        if (!usuarioStorage) {
          navigate('/login');
          return;
        }
        
        const usuario = JSON.parse(usuarioStorage);
        setUser(usuario);
      } catch (error) {
        console.error('Error al cargar el usuario:', error);
        toast.error('Error al cargar la información del usuario');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-grow bg-[#F9FAFB] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Bienvenido, {user ? user.nombre : 'Instructor'}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Mis Pedidos Card */}
            <div 
              onClick={() => navigate('/instructor/pedidos')}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#ECFDF5] mb-5">
                <span className="material-symbols-outlined text-4xl text-[#16A34A]">list_alt</span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900">Mis Pedidos</h3>
              <p className="text-gray-600 text-sm">Consulta y gestiona tus solicitudes de laboratorio existentes.</p>
            </div>

            {/* Crear Pedido Card */}
            <div 
              onClick={() => navigate('/instructor/pedidos/nuevo')}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#ECFDF5] mb-5">
                <span className="material-symbols-outlined text-4xl text-[#16A34A]">shopping_cart_checkout</span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900">Crear Pedido</h3>
              <p className="text-gray-600 text-sm">Inicia una nueva solicitud de materiales de laboratorio.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardInstructor;

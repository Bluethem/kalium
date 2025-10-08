import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { notificacionService } from '../services/api';

function Dashboard() {
  useEffect(() => {
    const verificarStockInicial = async () => {
      try {
        const response = await notificacionService.verificarStock();
        console.log('✅ Stock verificado:', response.data);
      } catch (error) {
        console.error('Error al verificar stock:', error);
      }
    };
    
    verificarStockInicial();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Panel de Administración</h2>
          <p className="text-gray-600 dark:text-gray-400">Seleccione una sección para administrar.</p>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/usuarios" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">group</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Usuarios</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestionar cuentas</p>
            </div>
          </Link>

          <Link to="/insumos" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">science</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Insumos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Administrar inventario</p>
            </div>
          </Link>

          <Link to="/pedidos" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">shopping_cart</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Pedidos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Revisar solicitudes</p>
            </div>
          </Link>

          {/* ✅ NUEVA TARJETA DE INCIDENTES */}
          <Link to="/incidentes" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Incidentes</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestionar incidencias</p>
            </div>
          </Link>

          <Link to="/reportes" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">analytics</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Reportes</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generar informes</p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';

function PanelInstructor() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Panel del Instructor</h2>
          <p className="text-gray-600 dark:text-gray-400">Seleccione una acción para continuar.</p>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          <Link to="/pedidos-instructor" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">list_alt</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Mis Pedidos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Consulta y gestiona tus solicitudes de laboratorio existentes.</p>
            </div>
          </Link>

          <Link to="/pedidos/nuevo" className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eef7f2] dark:bg-gray-700 text-[rgb(44,171,91)] group-hover:bg-[rgb(44,171,91)] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">shopping_cart_checkout</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Crear Pedido</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Inicia una nueva solicitud de materiales de laboratorio.</p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default PanelInstructor;

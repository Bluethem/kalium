import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaInsumos from './pages/Insumos/ListaInsumos';
import NuevoInsumo from './pages/Insumos/NuevoInsumo';
import DetalleInsumo from './pages/Insumos/DetalleInsumo';
import Reportes from './pages/Reportes/Reportes';
import Header from './components/Layout/Header';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
            <Header />
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Bienvenido a Kalium
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Sistema de Gestión de Laboratorio Químico
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <span className="material-symbols-outlined text-[#14378f] text-5xl mb-4">inventory_2</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Insumos</h3>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona el inventario de insumos del laboratorio</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <span className="material-symbols-outlined text-[#14378f] text-5xl mb-4">shopping_cart</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pedidos</h3>
                    <p className="text-gray-600 dark:text-gray-400">Administra pedidos de materiales</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <span className="material-symbols-outlined text-[#14378f] text-5xl mb-4">description</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reportes</h3>
                    <p className="text-gray-600 dark:text-gray-400">Genera informes detallados</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        } />
        <Route path="/insumos" element={<ListaInsumos />} />
        <Route path="/insumos/nuevo" element={<NuevoInsumo />} />
        <Route path="/insumos/:id" element={<DetalleInsumo />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/pedidos" element={
          <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
            <Header />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-gray-400 text-8xl mb-4">construction</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Página en Desarrollo</h2>
                <p className="text-gray-600 dark:text-gray-400">La gestión de pedidos estará disponible próximamente</p>
              </div>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
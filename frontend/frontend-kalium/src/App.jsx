import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaInsumos from './pages/Insumos/ListaInsumos';
import NuevoInsumo from './pages/Insumos/NuevoInsumo';
import DetalleInsumo from './pages/Insumos/DetalleInsumo';
import Reportes from './pages/Reportes/Reportes';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Cuenta from './pages/Cuenta';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/cuenta" element={<Cuenta />} />
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
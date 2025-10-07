import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaInsumos from './pages/Insumos/ListaInsumos';
import NuevoInsumo from './pages/Insumos/NuevoInsumo';
import DetalleInsumo from './pages/Insumos/DetalleInsumo';
import ListaPedidos from './pages/Pedidos/ListaPedidos';
import NuevoPedido from './pages/Pedidos/NuevoPedido';
import Reportes from './pages/Reportes/Reportes';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Cuenta from './pages/Cuenta';
import DetallePedido from './pages/Pedidos/DetallePedido';
import ListaNotificaciones from './pages/Notificaciones/ListaNotificaciones'; // ✅ NUEVO

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
        <Route path="/pedidos" element={<ListaPedidos />} />
        <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
        <Route path="/pedidos/:id" element={<DetallePedido />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/notificaciones" element={<ListaNotificaciones />} /> {/* ✅ NUEVO */}
      </Routes>
    </Router>
  );
}

export default App;
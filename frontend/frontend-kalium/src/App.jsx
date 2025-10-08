import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaInsumos from './pages/Insumos/ListaInsumos';
import NuevoInsumo from './pages/Insumos/NuevoInsumo';
import DetalleInsumo from './pages/Insumos/DetalleInsumo';
import ListaPedidos from './pages/Pedidos/ListaPedidos';
import NuevoPedido from './pages/Pedidos/NuevoPedido';
import DetallePedido from './pages/Pedidos/DetallePedido';
import Reportes from './pages/Reportes/Reportes';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Cuenta from './pages/Cuenta';
import ListaNotificaciones from './pages/Notificaciones/ListaNotificaciones';
import ListaIncidentes from './pages/Incidentes/ListaIncidentes'; // ✅ NUEVO
import DetalleIncidente from './pages/Incidentes/DetalleIncidente'; // ✅ NUEVO
import NuevoIncidente from './pages/Incidentes/NuevoIncidente'; // ✅ NUEVO

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
        <Route path="/notificaciones" element={<ListaNotificaciones />} />
        <Route path="/incidentes" element={<ListaIncidentes />} />
        <Route path="/incidentes/nuevo" element={<NuevoIncidente />} />
        <Route path="/incidentes/:id" element={<DetalleIncidente />} />
      </Routes>
    </Router>
  );
}

export default App;
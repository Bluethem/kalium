import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ListaIncidentes from './pages/Incidentes/ListaIncidentes';
import DetalleIncidente from './pages/Incidentes/DetalleIncidente';
import NuevoIncidente from './pages/Incidentes/NuevoIncidente';
import ListaEntregas from './pages/Entregas/ListaEntregas';
import DetalleEntrega from './pages/Entregas/DetalleEntrega';
import NuevaEntrega from './pages/Entregas/NuevaEntrega';
import ListaDevoluciones from './pages/Devoluciones/ListaDevoluciones';
import DetalleDevolucion from './pages/Devoluciones/DetalleDevolucion';
import NuevaDevolucion from './pages/Devoluciones/NuevaDevolucion';
import ListaExperimentos from './pages/Experimentos/ListaExperimentos';
import DetalleExperimento from './pages/Experimentos/DetalleExperimento';
import NuevoExperimento from './pages/Experimentos/NuevoExperimento';

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
        <Route path="/entregas" element={<ListaEntregas />} />
        <Route path="/entregas/nueva" element={<NuevaEntrega />} />
        <Route path="/entregas/:id" element={<DetalleEntrega />} />
        <Route path="/devoluciones" element={<ListaDevoluciones />} />
        <Route path="/devoluciones/nueva" element={<NuevaDevolucion />} />
        <Route path="/devoluciones/:id" element={<DetalleDevolucion />} />
        <Route path="/experimentos" element={<ListaExperimentos />} />
        <Route path="/experimentos/nuevo" element={<NuevoExperimento />} />
        <Route path="/experimentos/:id" element={<DetalleExperimento />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
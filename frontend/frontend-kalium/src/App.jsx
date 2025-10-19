import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ListaInsumos from './pages/Insumos/ListaInsumos';
import NuevoInsumo from './pages/Insumos/NuevoInsumo';
import DetalleInsumo from './pages/Insumos/DetalleInsumo';
import ListaPedidos from './pages/Pedidos/ListaPedidos';
import NuevoPedido from './pages/Pedidos/NuevoPedido';
import DetallePedido from './pages/Pedidos/DetallePedido';
import Reportes from './pages/Reportes/Reportes';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardEstudiante from './pages/DashboardEstudiante';
import MisEntregas from './pages/Estudiante/MisEntregas';
import Usuarios from './pages/Usuarios';
import Cuenta from './pages/Cuenta';
import ListaNotificaciones from './pages/Notificaciones/ListaNotificaciones';
import ListaIncidentes from './pages/Incidentes/ListaIncidentes';
import DetalleIncidente from './pages/Incidentes/DetalleIncidente';
import NuevoIncidente from './pages/Incidentes/NuevoIncidente';
import ListaEntregas from './pages/Entregas/ListaEntregas';
import DetalleEntrega from './pages/Entregas/DetalleEntrega';
import GenerarEntregas from './pages/Entregas/GenerarEntregas';
import ListaDevoluciones from './pages/Devoluciones/ListaDevoluciones';
import DetalleDevolucion from './pages/Devoluciones/DetalleDevolucion';
import ListaExperimentos from './pages/Experimentos/ListaExperimentos';
import DetalleExperimento from './pages/Experimentos/DetalleExperimento';
import NuevoExperimento from './pages/Experimentos/NuevoExperimento';
import EditarExperimento from './pages/Experimentos/EditarExperimento';
import ProtectedRoute from './components/ProtectedRoute';
import SolicitarDevolucion from './pages/Devoluciones/SolicitarDevolucion';
import Solicitudes from './pages/Solicitudes';
import MainLayout from './components/Layout/MainLayout';

function App() {
  useEffect(() => {
    const t = localStorage.getItem('theme');
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);
  return (
    <Router>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#2cab5b',
              secondary: '#fff',
            },
            style: {
              background: '#2cab5b',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Routes>
        {/* ========== RUTAS PÚBLICAS ========== */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ========== RUTAS PROTEGIDAS ========== */}
        <Route element={
          <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'ESTUDIANTE']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* ========== RUTAS DE ADMIN ========== */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          
          <Route path="usuarios" element={
            <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
              <Usuarios />
            </ProtectedRoute>
          } />
        
          {/* ========== INSUMOS ========== */}
          <Route path="insumos" element={
            <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
              <ListaInsumos />
            </ProtectedRoute>
          } />
        
          <Route path="insumos/nuevo" element={
            <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
              <NuevoInsumo />
            </ProtectedRoute>
          } />
        
          <Route path="insumos/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
              <DetalleInsumo />
            </ProtectedRoute>
          } />
        
          {/* ========== PEDIDOS ========== */}
          <Route path="pedidos">
            <Route index element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
                <ListaPedidos />
              </ProtectedRoute>
            } />
            
            <Route path="nuevo" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
                <NuevoPedido />
              </ProtectedRoute>
            } />
            
            <Route path=":id" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
                <DetallePedido />
              </ProtectedRoute>
            } />
          </Route>
        
          {/* ========== ENTREGAS (Solo Admin) ========== */}
          <Route path="entregas">
            <Route index element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <ListaEntregas />
              </ProtectedRoute>
            } />
            
            <Route path="generar/:idPedido" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <GenerarEntregas />
              </ProtectedRoute>
            } />
            
            <Route path=":id" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <DetalleEntrega />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* ========== DEVOLUCIONES ========== */}
          {/* Vista ADMIN - Revisar y aprobar devoluciones */}
          <Route path="devoluciones">
            <Route index element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <ListaDevoluciones />
              </ProtectedRoute>
            } />
            
            <Route path=":id" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <DetalleDevolucion />
              </ProtectedRoute>
            } />
          </Route>

          {/* Vista ESTUDIANTE - Solicitar devolución */}
          <Route path="solicitar-devolucion" element={
            <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
              <SolicitarDevolucion />
            </ProtectedRoute>
          } />
          
          {/* ========== INCIDENTES ========== */}
          <Route path="incidentes">
            <Route index element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <ListaIncidentes />
              </ProtectedRoute>
            } />
            
            <Route path="nuevo" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <NuevoIncidente />
              </ProtectedRoute>
            } />
            
            <Route path=":id" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'ESTUDIANTE']}>
                <DetalleIncidente />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* ========== REPORTES ========== */}
          <Route path="reportes" element={
            <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
              <Reportes />
            </ProtectedRoute>
          } />
          
          {/* ========== EXPERIMENTOS ========== */}
          <Route path="experimentos">
            <Route index element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
                <ListaExperimentos />
              </ProtectedRoute>
            } />
            
            <Route path="nuevo" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <NuevoExperimento />
              </ProtectedRoute>
            } />
            
            <Route path=":id" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN', 'INSTRUCTOR']}>
                <DetalleExperimento />
              </ProtectedRoute>
            } />
            
            <Route path=":id/editar" element={
              <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMIN_LABORATORIO', 'ADMIN']}>
                <EditarExperimento />
              </ProtectedRoute>
            } />
          </Route>
        
          {/* ========== RUTAS DE ESTUDIANTE ========== */}
          <Route path="dashboard-estudiante" element={
            <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
              <DashboardEstudiante />
            </ProtectedRoute>
          } />
          
          <Route path="mis-entregas" element={
            <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
              <MisEntregas />
            </ProtectedRoute>
          } />
          
          {/* ========== RUTAS COMPARTIDAS ========== */}
          <Route path="notificaciones" element={
            <ProtectedRoute>
              <ListaNotificaciones />
            </ProtectedRoute>
          } />
          
          <Route path="cuenta" element={
            <ProtectedRoute>
              <Cuenta />
            </ProtectedRoute>
          } />
        
          {/* ========== RUTA POR DEFECTO ========== */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaInsumos from './pages/Insumos/ListaInsumos';
import NuevoInsumo from './pages/Insumos/NuevoInsumo';
import DetalleInsumo from './pages/Insumos/DetalleInsumo';
import Reportes from './pages/Reportes/Reportes';
import { usuarioService, generalService } from './services/api';
import { Users, MessageCircle, Heart, Plus } from 'lucide-react';
import './App.css';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    activo: true
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios y mensaje en paralelo
      const [responseUsuarios, responseMensaje] = await Promise.all([
        usuarioService.getUsuarios(),
        generalService.getMensaje()
      ]);

      setUsuarios(responseUsuarios.data);
      setMensaje(responseMensaje.data.mensaje);
      setError('');
    } catch (err) {
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoUsuario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const response = await usuarioService.createUsuario(nuevoUsuario);
      console.log('Usuario creado:', response.data);
      
      // Recargar usuarios
      await cargarDatosIniciales();
      
      // Limpiar formulario
      setNuevoUsuario({ nombre: '', email: '', activo: true });
      
      alert('Usuario creado exitosamente!');
    } catch (err) {
      setError('Error al crear usuario: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando datos desde Spring Boot...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <header className="app-header">
              <h1>🚀 Kalium App - React + Spring Boot</h1>
              <p className="app-subtitle">{mensaje}</p>
            </header>

            {error && (
              <div className="error-banner">
                ⚠️ {error}
                <button onClick={() => setError('')}>×</button>
              </div>
            )}

            <main className="app-main">
              {/* Sección de crear usuario */}
              <section className="section">
                <h2><Plus size={20} /> Crear Nuevo Usuario</h2>
                <form onSubmit={handleCrearUsuario} className="form">
                  <div className="form-group">
                    <label>Nombre:</label>
                    <input
                      type="text"
                      name="nombre"
                      value={nuevoUsuario.nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={nuevoUsuario.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: juan@email.com"
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="activo"
                        checked={nuevoUsuario.activo}
                        onChange={handleInputChange}
                      />
                      Usuario activo
                    </label>
                  </div>
                  
                  <button type="submit" className="btn-primary">
                    <Plus size={16} /> Crear Usuario
                  </button>
                </form>
              </section>

              {/* Sección de listado de usuarios */}
              <section className="section">
                <h2><Users size={20} /> Lista de Usuarios ({usuarios.length})</h2>
                
                <div className="usuarios-grid">
                  {usuarios.map(usuario => (
                    <div key={usuario.id} className="usuario-card">
                      <div className="usuario-header">
                        <h3>{usuario.nombre}</h3>
                        <span className={`status ${usuario.activo ? 'active' : 'inactive'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="usuario-info">
                        <p>📧 {usuario.email}</p>
                        <p>🆔 ID: {usuario.id}</p>
                        <p>📅 Creado: {new Date(usuario.fechaCreacion).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="usuario-actions">
                        <button className="btn-secondary">Editar</button>
                        <button className="btn-danger">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer className="app-footer">
              <p>✅ Conectado a Spring Boot en http://localhost:8080</p>
            </footer>
          </div>
        } />
        <Route path="/insumos" element={<ListaInsumos />} />
        <Route path="/insumos/nuevo" element={<NuevoInsumo />} />
        <Route path="/insumos/:id" element={<DetalleInsumo />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/pedidos" element={<div className="p-8 text-center">Página de Pedidos - En desarrollo</div>} />
      </Routes>
    </Router>
  );
}

export default App;
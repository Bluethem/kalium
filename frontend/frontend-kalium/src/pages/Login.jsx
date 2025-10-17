import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const correo = e.target.email.value;
    const contrasena = e.target.password.value;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('usuario', JSON.stringify(user));

        // Detectar el tipo de usuario
        const tipoUsuario = await detectarTipoUsuario(user);

        // Redirigir según el tipo de usuario
        if (tipoUsuario === 'instructor') {
          navigate('/dashboard-instructor');
        } else {
          // Administrador u otro rol cae al dashboard principal
          navigate('/dashboard');
        }
      } else {
        const msg = await res.text();
        alert(msg || 'Error de inicio de sesión');
        setLoading(false);
      }
    } catch (err) {
      alert('No se pudo conectar con el servidor');
      console.error(err);
      setLoading(false);
    }
  }

  // Función para detectar si el usuario es Administrador o Instructor
  async function detectarTipoUsuario(usuario) {
    try {
      const rolNombre = usuario?.rol?.nombreRol ? String(usuario.rol.nombreRol).toUpperCase() : '';

      if (rolNombre === 'INSTRUCTOR') {
        return 'instructor';
      }

      if (rolNombre.startsWith('ADMIN')) {
        return 'administrador';
      }

      // Fallback: consultas existentes por si no llegó el rol en la respuesta
      if (usuario?.idUsuario) {
        const instructoresRes = await axios.get('http://localhost:8080/api/instructores');
        const esInstructor = (instructoresRes.data || []).some(
          inst => inst.usuario?.idUsuario === usuario.idUsuario
        );
        if (esInstructor) {
          return 'instructor';
        }
      }

      return 'usuario';
    } catch (error) {
      console.error('Error al detectar tipo de usuario:', error);
      return 'usuario';
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header minimal />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">Bienvenido de Nuevo</h2>
            <p className="mt-2 text-base text-gray-500">Inicia sesión en tu cuenta de Kalium.</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="sr-only" htmlFor="email">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">email</span>
                <input
                  autoComplete="email"
                  className="form-input w-full rounded-md border-gray-300 bg-white py-3 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]"
                  id="email"
                  name="email"
                  placeholder="tu.correo@ejemplo.com"
                  required
                  type="email"
                />
              </div>
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input
                  autoComplete="current-password"
                  className="form-input w-full rounded-md border-gray-300 bg-white py-3 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]"
                  id="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  required
                  type="password"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                className="flex w-full justify-center rounded-md bg-[rgb(44,171,91)] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(44,171,91)] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <a className="font-medium text-[rgb(44,171,91)] hover:text-opacity-80" href="/register">Regístrate aquí</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;

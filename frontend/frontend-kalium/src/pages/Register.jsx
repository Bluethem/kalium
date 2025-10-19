import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';

function Register() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const nombre = e.target.nombre.value.trim();
    const apellido = e.target.apellido.value.trim();
    const correo = e.target.correo.value.trim();
    const contrasena = e.target.contrasena.value;
    const confirmar = e.target.confirmar.value;
    const rolSeleccionado = e.target.rol?.value; // 2=admin, 3=instructor, 4=alumno

    if (contrasena !== confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, correo, contrasena, idRol: Number(rolSeleccionado) })
      });
      if (res.ok) {
        setShowModal(true);
      } else {
        const msg = await res.text();
        alert(msg || 'No se pudo enviar la solicitud');
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header minimal />
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Crear una Cuenta</h2>
            <p className="mt-2 text-base text-gray-500">Regístrate para empezar a usar Kalium.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="sr-only" htmlFor="nombre">Nombre</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
                  <input id="nombre" name="nombre" required type="text" placeholder="Nombre"
                         className="form-input w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]" />
                </div>
              </div>
              <div>
                <label className="sr-only" htmlFor="apellido">Apellido</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
                  <input id="apellido" name="apellido" required type="text" placeholder="Apellido"
                         className="form-input w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]" />
                </div>
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="correo">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">email</span>
                <input id="correo" name="correo" required type="email" placeholder="tu.correo@ejemplo.com" autoComplete="email"
                       className="form-input w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]" />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="contrasena">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input id="contrasena" name="contrasena" required type="password" placeholder="Crea una contraseña" autoComplete="new-password"
                       className="form-input w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]" />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="confirmar">Confirmar Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock_reset</span>
                <input id="confirmar" name="confirmar" required type="password" placeholder="Confirma tu contraseña" autoComplete="new-password"
                       className="form-input w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]" />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="rol">Rol</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">supervisor_account</span>
                <select id="rol" name="rol" required defaultValue=""
                        className="form-input w-full appearance-none rounded-md border-gray-300 bg-white dark:bg-gray-800 py-3 pl-10 pr-10 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]">
                  <option value="" disabled>Selecciona un rol</option>
                  <option value="2">Administrador</option>
                  <option value="3">Instructor</option>
                  <option value="4">Alumno</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">expand_more</span>
              </div>
            </div>

            <div className="pt-2"> 
              <button type="submit" className="flex w-full justify-center rounded-md bg-[rgb(44,171,91)] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(44,171,91)]">
                Enviar solicitud de registro
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta? <a className="font-medium text-[rgb(44,171,91)] hover:text-opacity-80" href="/login">Inicia sesión aquí</a>
          </p>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-800 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(44,171,91)]/10 text-[rgb(44,171,91)]">
              <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Solicitud enviada</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Tu solicitud ha sido enviada. Recibirás una confirmación en tu correo.</p>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center rounded-md bg-[rgb(44,171,91)] px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(44,171,91)]"
              >
                Ir a iniciar sesión
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;

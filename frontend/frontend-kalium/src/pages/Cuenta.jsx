import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';

function Cuenta() {
  const [form, setForm] = useState({ idUsuario: null, nombre: '', apellido: '', correo: '', contrasena: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    if (u) {
      try {
        const parsed = JSON.parse(u);
        setForm({ idUsuario: parsed.idUsuario, nombre: parsed.nombre || '', apellido: parsed.apellido || '', correo: parsed.correo || '', contrasena: '' });
      } catch {}
    }
    setLoading(false);
  }, []);

  function actualizarCampo(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const newErrors = {};
      const correoTrim = (form.correo || '').trim();
      const nombreTrim = (form.nombre || '').trim();
      const apellidoTrim = (form.apellido || '').trim();
      if (!nombreTrim) newErrors.nombre = 'El nombre es obligatorio';
      if (!apellidoTrim) newErrors.apellido = 'El apellido es obligatorio';
      if (!correoTrim) {
        newErrors.correo = 'El correo es obligatorio';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correoTrim)) newErrors.correo = 'Formato de correo inválido';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Revisa los campos del formulario');
      }

      // PUT al backend
      const res = await fetch(`http://localhost:8080/api/usuarios/${form.idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, apellido: form.apellido, correo: form.correo, contrasena: form.contrasena })
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      // Refrescar localStorage (sin contraseña)
      localStorage.setItem('usuario', JSON.stringify(updated));
      alert('Datos actualizados correctamente');
    } catch (err) {
      alert(err.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">Cargando...</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
        <form onSubmit={guardar} className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-4 text-center">
            <div className="mx-auto size-16 rounded-full bg-cover bg-center mb-4"
                 style={{ backgroundImage: 'url("https://ui-avatars.com/api/?name=Usuario&background=14378f&color=fff")' }} />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mi cuenta</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Actualiza tu información personal</p>
          </div>

          <div className="px-6 sm:px-8 pb-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="sr-only" htmlFor="nombre">Nombre</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
                <input id="nombre" name="nombre" value={form.nombre} onChange={actualizarCampo} type="text" placeholder="Nombre"
                  aria-invalid={!!errors.nombre}
                  className={`form-input w-full rounded-md bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset ${errors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[rgb(44,171,91)]'}`} />
              </div>
              {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
            </div>
            <div>
              <label className="sr-only" htmlFor="apellido">Apellido</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
                <input id="apellido" name="apellido" value={form.apellido} onChange={actualizarCampo} type="text" placeholder="Apellido"
                  aria-invalid={!!errors.apellido}
                  className={`form-input w-full rounded-md bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset ${errors.apellido ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[rgb(44,171,91)]'}`} />
              </div>
              {errors.apellido && <p className="mt-1 text-xs text-red-600">{errors.apellido}</p>}
            </div>
          </div>

          <div>
            <label className="sr-only" htmlFor="correo">Correo</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">email</span>
              <input id="correo" name="correo" value={form.correo} onChange={actualizarCampo} type="email" placeholder="tu.correo@ejemplo.com"
                aria-invalid={!!errors.correo}
                className={`form-input w-full rounded-md bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset ${errors.correo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[rgb(44,171,91)]'}`} />
            </div>
            {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo}</p>}
          </div>

          <div>
            <label className="sr-only" htmlFor="contrasena">Contraseña</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
              <input id="contrasena" name="contrasena" value={form.contrasena} onChange={actualizarCampo} type="password" placeholder="Dejar en blanco para no cambiar"
                className={`form-input w-full rounded-md bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset border-gray-300 focus:ring-[rgb(44,171,91)]`} />
            </div>
            <p className="mt-1 text-xs text-gray-500">Solo completa si deseas actualizar tu contraseña</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-md bg-[rgb(44,171,91)] text-white font-bold hover:bg-opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Cuenta;

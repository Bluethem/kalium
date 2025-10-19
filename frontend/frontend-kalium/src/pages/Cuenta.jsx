import React, { useEffect, useState } from 'react';

function Cuenta() {
  const [form, setForm] = useState({ idUsuario: null, nombre: '', apellido: '', correo: '', contrasena: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [dark, setDark] = useState(() => (localStorage.getItem('theme') === 'dark'));
  const [userLogo, setUserLogo] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    if (u) {
      try {
        const parsed = JSON.parse(u);
        setForm({ idUsuario: parsed.idUsuario, nombre: parsed.nombre || '', apellido: parsed.apellido || '', correo: parsed.correo || '', contrasena: '' });
        setUserLogo(parsed?.logo || null);
      } catch {}
    }
    setLoading(false);
  }, []);

  // Manejo de selección de imagen para logo
  function onPickLogoClick() {
    const input = document.getElementById('input-logo-usuario');
    if (input) input.click();
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64 = typeof result === 'string' ? result.split(',')[1] : '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onLogoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      return;
    }
    try {
      const b64 = await toBase64(file);
      setLogoBase64(b64);
      setUserLogo(b64);
      // Actualizar vista inmediata en header
      try {
        const u = localStorage.getItem('usuario');
        if (u) {
          const parsed = JSON.parse(u);
          parsed.logo = b64;
          localStorage.setItem('usuario', JSON.stringify(parsed));
        }
      } catch {}
    } catch (err) {
      alert('No se pudo leer la imagen seleccionada');
    } finally {
      e.target.value = '';
    }
  }

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

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

      // PUT al backend (incluye logo si está disponible)
      const payload = { nombre: form.nombre, apellido: form.apellido, correo: form.correo, contrasena: form.contrasena };
      if (logoBase64) payload.logo = logoBase64;
      const res = await fetch(`http://localhost:8080/api/usuarios/${form.idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      // Refrescar localStorage (sin contraseña) y logo si backend lo devolvió
      const usuarioLocal = { ...updated };
      if (logoBase64 && !usuarioLocal.logo) {
        usuarioLocal.logo = logoBase64;
      }
      localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
      setUserLogo(usuarioLocal.logo || userLogo);
      alert('Datos actualizados correctamente');
    } catch (err) {
      alert(err.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2cab5b] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando información de la cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
        <form onSubmit={guardar} className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-4">
            <div className="text-center">
                <div className="mx-auto mb-4">
                  <button
                    type="button"
                    onClick={onPickLogoClick}
                    className="group relative size-16 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[rgb(44,171,91)]"
                    title="Cambiar imagen"
                  >
                    {userLogo ? (
                      <img
                        src={`data:image/png;base64,${userLogo}`}
                        alt="Logo de usuario"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[rgb(44,171,91)] text-white flex items-center justify-center text-xl font-bold">
                        {(form.correo || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gray-200/0 group-hover:bg-gray-200/60 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-700 font-medium transition-opacity">Cambiar imagen</span>
                    </div>
                  </button>
                  <input id="input-logo-usuario" type="file" accept="image/*" className="hidden" onChange={onLogoFileChange} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mi cuenta</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Actualiza tu información personal</p>
                <div className="mt-4 flex justify-center">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 select-none">
                    <span>Tema oscuro</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dark}
                      onClick={() => setDark(d => !d)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dark ? 'bg-[rgb(44,171,91)]' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${dark ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </label>
                </div>
              </div>
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
      </div>
    </div>
  );
}

export default Cuenta;

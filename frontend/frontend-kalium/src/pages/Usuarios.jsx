import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ idUsuario: null, nombre: '', apellido: '', correo: '', contrasena: '' });
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [tamPagina, setTamPagina] = useState(10);
  const [errors, setErrors] = useState({});

  async function cargarUsuarios() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/usuarios');
      if (!res.ok) throw new Error('No se pudieron obtener los usuarios');
      const data = await res.json();
      setUsuarios(data);
      setError('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function eliminarUsuario(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      await cargarUsuarios();
    } catch (e) {
      alert(e.message || 'No se pudo eliminar el usuario');
    }
  }

  function abrirCrear() {
    setEditing(false);
    setForm({ idUsuario: null, nombre: '', apellido: '', correo: '', contrasena: '' });
    setModalOpen(true);
  }

  function abrirEditar(u) {
    setEditing(true);
    setForm({ idUsuario: u.idUsuario, nombre: u.nombre, apellido: u.apellido, correo: u.correo, contrasena: '' });
    setModalOpen(true);
  }

  function actualizarCampo(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      // Validación básica de formulario
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
      if (!editing && !(form.contrasena || '').trim()) {
        newErrors.contrasena = 'La contraseña es obligatoria al crear usuario';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Revisa los campos del formulario');
      }
      // Validación de correo duplicado
      if (!correoTrim) throw new Error('El correo es requerido');
      let existente = null;
      try {
        const resExiste = await fetch(`http://localhost:8080/api/usuarios/correo/${encodeURIComponent(correoTrim)}`);
        if (resExiste.ok) {
          existente = await resExiste.json();
        }
      } catch {}

      if (!editing) {
        if (existente) {
          throw new Error('El correo ya está registrado');
        }
      } else {
        if (existente && existente.idUsuario !== form.idUsuario) {
          throw new Error('El correo ya está registrado por otro usuario');
        }
      }

      let res;
      if (editing) {
        // PUT: si contrasena vacía, backend la ignora según lógica existente
        res = await fetch(`http://localhost:8080/api/usuarios/${form.idUsuario}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: form.nombre, apellido: form.apellido, correo: form.correo, contrasena: form.contrasena })
        });
      } else {
        res = await fetch('http://localhost:8080/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: form.nombre, apellido: form.apellido, correo: form.correo, contrasena: form.contrasena })
        });
      }
      if (!res.ok) throw new Error(await res.text());
      setModalOpen(false);
      setErrors({});
      await cargarUsuarios();
    } catch (err) {
      alert(err.message || 'No se pudo guardar el usuario');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Ver, crear, editar o eliminar información de usuarios.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                value={busqueda}
                onChange={(e)=>{ setBusqueda(e.target.value); setPagina(1); }}
                placeholder="Buscar por nombre, apellido o correo"
                className="form-input w-72 rounded-md border-gray-300 bg-white dark:bg-gray-800 py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(44,171,91)]"
                type="text"
              />
            </div>
            <button onClick={abrirCrear} className="inline-flex items-center justify-center gap-2 rounded-md bg-[rgb(44,171,91)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-opacity-90">
              <span className="material-symbols-outlined">add</span>
              Agregar Usuario
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-600 dark:text-gray-300">Cargando...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Apellido</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Correo</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {(
                    usuarios.filter(u => {
                      const q = busqueda.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        (u.nombre || '').toLowerCase().includes(q) ||
                        (u.apellido || '').toLowerCase().includes(q) ||
                        (u.correo || '').toLowerCase().includes(q)
                      );
                    })
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-600 dark:text-gray-300">
                        No hay usuarios para mostrar.
                      </td>
                    </tr>
                  ) : (
                    (
                      () => {
                        const filtrados = usuarios.filter(u => {
                          const q = busqueda.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            (u.nombre || '').toLowerCase().includes(q) ||
                            (u.apellido || '').toLowerCase().includes(q) ||
                            (u.correo || '').toLowerCase().includes(q)
                          );
                        });
                        const total = filtrados.length;
                        const totalPaginas = Math.max(1, Math.ceil(total / tamPagina));
                        const page = Math.min(pagina, totalPaginas);
                        const inicio = (page - 1) * tamPagina;
                        const visibles = filtrados.slice(inicio, inicio + tamPagina);
                        return visibles.map(u => (
                          <tr key={u.idUsuario}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{u.idUsuario}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{u.nombre}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{u.apellido}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{u.correo}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-3">
                                <button onClick={() => abrirEditar(u)} className="text-gray-400 hover:text-[rgb(44,171,91)]">
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button onClick={() => eliminarUsuario(u.idUsuario)} className="text-gray-400 hover:text-red-600">
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      }
                    )()
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
            <form onSubmit={guardar} className="space-y-4">
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
                  <input id="contrasena" name="contrasena" value={form.contrasena} onChange={actualizarCampo} type="password" placeholder={editing ? 'Dejar en blanco para no cambiar' : 'Crea una contraseña'}
                    aria-invalid={!!errors.contrasena}
                    className={`form-input w-full rounded-md bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset ${errors.contrasena ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[rgb(44,171,91)]'}`} />
                </div>
                {!editing && !errors.contrasena && <p className="mt-1 text-xs text-gray-500">Requerida al crear usuario</p>}
                {errors.contrasena && <p className="mt-1 text-xs text-red-600">{errors.contrasena}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-[rgb(44,171,91)] text-white font-bold hover:bg-opacity-90">{editing ? 'Guardar cambios' : 'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;

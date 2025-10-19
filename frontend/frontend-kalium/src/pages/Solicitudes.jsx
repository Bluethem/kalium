import React, { useEffect, useMemo, useState } from 'react';

function Solicitudes() {
  const [data, setData] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null, action: null });

  const rolLabel = useMemo(() => ({ 2: 'Administrador', 3: 'Instructor', 4: 'Alumno' }), []);

  async function cargar() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/solicitudes');
      const list = await res.json();
      setData(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function abrirConfirm(id, action) {
    setConfirm({ open: true, id, action });
  }

  function cerrarConfirm() {
    setConfirm({ open: false, id: null, action: null });
  }

  async function ejecutarAccion() {
    if (!confirm.id || !confirm.action) return;
    try {
      if (confirm.action === 'aceptar') {
        const res = await fetch(`http://localhost:8080/api/solicitudes/${confirm.id}/aceptar`, { method: 'POST' });
        if (!res.ok) throw new Error(await res.text());
      } else if (confirm.action === 'rechazar') {
        const res = await fetch(`http://localhost:8080/api/solicitudes/${confirm.id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) throw new Error(await res.text());
      }
      cerrarConfirm();
      await cargar();
    } catch (e) {
      console.error(e);
      alert('No se pudo completar la acción');
    }
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Solicitudes</h2>
              <p className="text-gray-600 dark:text-gray-400">Revisa y gestiona las solicitudes de registro.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por rol:</span>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:border-[rgb(44,171,91)] focus:ring-[rgb(44,171,91)]"
              >
                <option value="">Todos los roles</option>
                <option value="2">Administrador</option>
                <option value="3">Instructor</option>
                <option value="4">Alumno</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Apellido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Correo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contraseña</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={7}>Cargando...</td>
                  </tr>
                ) : data.filter(s => !filtroRol || s.idRol.toString() === filtroRol).length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={7}>No hay solicitudes pendientes</td>
                  </tr>
                ) : (
                  data
                    .filter(s => !filtroRol || s.idRol.toString() === filtroRol)
                    .map((s) => (
                    <tr key={s.idSolicitud || s.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{s.idSolicitud ?? s.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{s.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{s.apellido}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{s.correo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{s.contrasena}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{rolLabel[s.idRol] || s.idRol}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => abrirConfirm(s.idSolicitud ?? s.id, 'aceptar')} className="inline-flex items-center gap-1 rounded-md bg-[rgb(44,171,91)] px-3 py-1.5 text-white text-xs font-bold hover:bg-opacity-90">
                            <span className="material-symbols-outlined text-base">check</span>
                            Aceptar
                          </button>
                          <button onClick={() => abrirConfirm(s.idSolicitud ?? s.id, 'rechazar')} className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined text-base">close</span>
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {confirm.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-full max-w-md mx-4 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-800 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                <span className="material-symbols-outlined text-3xl">help</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirmar acción</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                ¿Seguro que deseas {confirm.action === 'aceptar' ? 'aceptar' : 'rechazar'} esta solicitud?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={ejecutarAccion} className="inline-flex items-center justify-center rounded-md bg-[rgb(44,171,91)] px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90">
                  Confirmar
                </button>
                <button onClick={cerrarConfirm} className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Solicitudes;

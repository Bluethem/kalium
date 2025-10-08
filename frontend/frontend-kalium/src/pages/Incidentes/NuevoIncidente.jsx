import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { incidenteService, estudianteService, devolucionService } from '../../services/api';

const NuevoIncidente = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [estadosIncidente, setEstadosIncidente] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formIncidente, setFormIncidente] = useState({
    descripcion: '',
    fechaIncidente: new Date().toISOString().split('T')[0],
    fechaSolucion: '',
    idDevolucion: '',
    idEstudiante: '',
    idEstIncidente: 1 // Por defecto "Reportado"
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [estudiantesRes, devolucionesRes, estadosRes] = await Promise.all([
        estudianteService.getEstudiantes(),
        devolucionService.getDevoluciones(),
        incidenteService.getEstadosIncidente()
      ]);
      
      setEstudiantes(estudiantesRes.data || []);
      setDevoluciones(devolucionesRes.data || []);
      setEstadosIncidente(estadosRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormIncidente(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (!formIncidente.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }

      if (!formIncidente.idEstudiante) {
        throw new Error('Debe seleccionar un estudiante');
      }

      if (!formIncidente.idDevolucion) {
        throw new Error('Debe seleccionar una devolución');
      }

      const incidenteData = {
        descripcion: formIncidente.descripcion,
        fechaIncidente: formIncidente.fechaIncidente,
        fechaSolucion: formIncidente.fechaSolucion || null,
        devolucion: { idDevolucion: parseInt(formIncidente.idDevolucion) },
        estudiante: { idEstudiante: parseInt(formIncidente.idEstudiante) },
        estIncidente: { idEstIncidente: parseInt(formIncidente.idEstIncidente) }
      };

      await incidenteService.createIncidente(incidenteData);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error al crear incidente:', error);
      setErrorMessage(error.response?.data || error.message || 'No se pudo crear el incidente');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Nuevo Incidente</h2>
            <p className="text-gray-500 dark:text-gray-400">Complete el formulario para registrar un nuevo incidente.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información del Incidente */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información del Incidente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción del Incidente *
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formIncidente.descripcion}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Describa el incidente en detalle..."
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="fechaIncidente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha del Incidente *
                  </label>
                  <input
                    type="date"
                    id="fechaIncidente"
                    name="fechaIncidente"
                    value={formIncidente.fechaIncidente}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="fechaSolucion" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fecha de Solución (Opcional)
                  </label>
                  <input
                    type="date"
                    id="fechaSolucion"
                    name="fechaSolucion"
                    value={formIncidente.fechaSolucion}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Dejar en blanco si aún no está resuelto</p>
                </div>

                <div>
                  <label htmlFor="idEstudiante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estudiante *
                  </label>
                  <select
                    id="idEstudiante"
                    name="idEstudiante"
                    value={formIncidente.idEstudiante}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar estudiante</option>
                    {estudiantes.map(est => (
                      <option key={est.idEstudiante} value={est.idEstudiante}>
                        {est.nombre} {est.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idDevolucion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Devolución Asociada *
                  </label>
                  <select
                    id="idDevolucion"
                    name="idDevolucion"
                    value={formIncidente.idDevolucion}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar devolución</option>
                    {devoluciones.map(dev => (
                      <option key={dev.idDevolucion} value={dev.idDevolucion}>
                        #DEV{String(dev.idDevolucion).padStart(3, '0')} - {new Date(dev.fechaDevolucion).toLocaleDateString('es-ES')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idEstIncidente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado del Incidente
                  </label>
                  <select
                    id="idEstIncidente"
                    name="idEstIncidente"
                    value={formIncidente.idEstIncidente}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    {estadosIncidente.map(estado => (
                      <option key={estado.idEstIncidente} value={estado.idEstIncidente}>
                        {estado.estadoIncidente}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/incidentes')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-smfont-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Incidente'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">
                  check
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Incidente Registrado con Éxito!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                El incidente ha sido registrado y notificado a los administradores.
              </p>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/incidentes');
                  }}
                  className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
                  error
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Error al Registrar Incidente
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {errorMessage || 'No se pudo registrar el incidente. Por favor, intente nuevamente.'}
              </p>
              <button
                onClick={() => {
                  setShowError(false);
                  setErrorMessage('');
                }}
                className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoIncidente;
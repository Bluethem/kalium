import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { devolucionService, entregaService, estDevolucionService } from '../../services/api';

const NuevaDevolucion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entregaIdParam = searchParams.get('entrega');

  const [loading, setLoading] = useState(false);
  const [entregas, setEntregas] = useState([]);
  const [estadosDevolucion, setEstadosDevolucion] = useState([]);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devolucionCreada, setDevolucionCreada] = useState(null);
  
  const [formDevolucion, setFormDevolucion] = useState({
    fechaDevolucion: new Date().toISOString().split('T')[0],
    horaDevolucion: new Date().toISOString().slice(0, 16),
    idEntrega: entregaIdParam || '',
    idEstDevolucion: 1 // Por defecto "Completa"
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formDevolucion.idEntrega) {
      cargarDetallesEntrega(formDevolucion.idEntrega);
    } else {
      setEntregaSeleccionada(null);
    }
  }, [formDevolucion.idEntrega]);

  const cargarDatos = async () => {
    try {
      const [entregasRes, estadosRes] = await Promise.all([
        entregaService.getEntregas(),
        estDevolucionService.getEstados()
      ]);
      
      // Filtrar solo entregas que NO tengan devolución registrada
      const todasEntregas = entregasRes.data || [];
      const devolucionesRes = await devolucionService.getDevoluciones();
      const entregasConDevolucion = new Set(
        (devolucionesRes.data || []).map(d => d.entrega?.idEntrega)
      );
      
      const entregasDisponibles = todasEntregas.filter(
        e => !entregasConDevolucion.has(e.idEntrega)
      );
      
      setEntregas(entregasDisponibles);
      setEstadosDevolucion(estadosRes.data || []);

      if (entregaIdParam && entregasDisponibles.some(e => e.idEntrega === parseInt(entregaIdParam))) {
        setFormDevolucion(prev => ({ ...prev, idEntrega: entregaIdParam }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorMessage('Error al cargar los datos iniciales');
      setShowError(true);
    }
  };

  const cargarDetallesEntrega = async (idEntrega) => {
    try {
      const response = await entregaService.getEntregaById(idEntrega);
      setEntregaSeleccionada(response.data);
    } catch (error) {
      console.error('Error al cargar detalles de la entrega:', error);
      setErrorMessage('Error al cargar los detalles de la entrega');
      setShowError(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDevolucion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Validaciones
      if (!formDevolucion.idEntrega) {
        throw new Error('Debe seleccionar una entrega');
      }

      if (!formDevolucion.idEstDevolucion) {
        throw new Error('Debe seleccionar un estado de devolución');
      }

      // Crear la devolución
      const devolucionData = {
        fechaDevolucion: formDevolucion.fechaDevolucion,
        horaDevolucion: formDevolucion.horaDevolucion,
        pedido: { idPedido: parseInt(entregaSeleccionada.pedido.idPedido) },
        estDevolucion: { idEstDevolucion: parseInt(formDevolucion.idEstDevolucion) },
        entrega: { idEntrega: parseInt(formDevolucion.idEntrega) }
      };

      console.log('Enviando devolución:', devolucionData);
      const response = await devolucionService.createDevolucion(devolucionData);
      console.log('Respuesta del servidor:', response);
      
      setDevolucionCreada(response.data);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del error:', error.response);
      setErrorMessage(error.response?.data || error.message || 'No se pudo crear la devolución');
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Nueva Devolución</h2>
            <p className="text-gray-500 dark:text-gray-400">Complete el formulario para registrar una nueva devolución.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información de la Devolución */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información de la Devolución</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="idEntrega" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entrega *
                  </label>
                  <select
                    id="idEntrega"
                    name="idEntrega"
                    value={formDevolucion.idEntrega}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar entrega</option>
                    {entregas.map(entrega => (
                      <option key={entrega.idEntrega} value={entrega.idEntrega}>
                        #ENT{String(entrega.idEntrega).padStart(3, '0')} - {entrega.estudiante?.nombre} {entrega.estudiante?.apellido}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Solo se muestran entregas sin devolución registrada
                  </p>
                </div>

                <div>
                  <label htmlFor="idEstDevolucion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado de la Devolución *
                  </label>
                  <select
                    id="idEstDevolucion"
                    name="idEstDevolucion"
                    value={formDevolucion.idEstDevolucion}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    {estadosDevolucion.map(estado => (
                      <option key={estado.idEstDevolucion} value={estado.idEstDevolucion}>
                        {estado.estadoDevolucion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fechaDevolucion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Devolución *
                  </label>
                  <input
                    type="date"
                    id="fechaDevolucion"
                    name="fechaDevolucion"
                    value={formDevolucion.fechaDevolucion}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="horaDevolucion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora de Devolución *
                  </label>
                  <input
                    type="datetime-local"
                    id="horaDevolucion"
                    name="horaDevolucion"
                    value={formDevolucion.horaDevolucion}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>
              </div>
            </div>

            {/* Información de la Entrega Seleccionada */}
            {entregaSeleccionada && (
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Información de la Entrega #ENT{String(entregaSeleccionada.idEntrega).padStart(3, '0')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Estudiante</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          {entregaSeleccionada.estudiante?.nombre} {entregaSeleccionada.estudiante?.apellido}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Pedido</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          #PED{String(entregaSeleccionada.pedido?.idPedido || 0).padStart(3, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Fecha de Entrega</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          {entregaSeleccionada.fechaEntrega ? new Date(entregaSeleccionada.fechaEntrega).toLocaleDateString('es-ES') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/devoluciones')}
                disabled={loading}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">check</span>
                    Registrar Devolución
                  </>
                )}
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
                ¡Devolución Registrada con Éxito!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                La devolución #DEV{String(devolucionCreada?.idDevolucion || 0).padStart(3, '0')} ha sido registrada correctamente.
              </p>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate(`/devoluciones/${devolucionCreada?.idDevolucion}`)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Ver Detalle
                </button>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/devoluciones');
                  }}
                  className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
                >
                  Ir a Devoluciones
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
                Error al Registrar Devolución
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {errorMessage}
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

export default NuevaDevolucion;
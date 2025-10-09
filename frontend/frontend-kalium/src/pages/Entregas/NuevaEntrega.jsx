import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { entregaService, pedidoService, estudianteService, insumoService, quimicoService } from '../../services/api';

const NuevaEntrega = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [insumosDisponibles, setInsumosDisponibles] = useState([]);
  const [quimicosDisponibles, setQuimicosDisponibles] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [entregaCreada, setEntregaCreada] = useState(null);
  
  const [formEntrega, setFormEntrega] = useState({
    fechaEntrega: new Date().toISOString().split('T')[0],
    horaEntrega: new Date().toISOString().slice(0, 16),
    idPedido: '',
    idEstudiante: ''
  });

  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
  const [quimicosSeleccionados, setQuimicosSeleccionados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, estudiantesRes, insumosRes, quimicosRes] = await Promise.all([
        pedidoService.getPedidos(),
        estudianteService.getEstudiantes(),
        insumoService.getInsumosPorEstado(1), // Estado "Disponible" = 1
        quimicoService.getQuimicos()
      ]);
      
      setPedidos(pedidosRes.data || []);
      setEstudiantes(estudiantesRes.data || []);
      setInsumosDisponibles(insumosRes.data || []);
      setQuimicosDisponibles(quimicosRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEntrega(prev => ({ ...prev, [name]: value }));
  };

  const agregarInsumo = (idInsumo) => {
    const insumo = insumosDisponibles.find(i => i.idInsumo === parseInt(idInsumo));
    if (insumo && !insumosSeleccionados.find(i => i.idInsumo === insumo.idInsumo)) {
      setInsumosSeleccionados([...insumosSeleccionados, insumo]);
    }
  };

  const quitarInsumo = (idInsumo) => {
    setInsumosSeleccionados(insumosSeleccionados.filter(i => i.idInsumo !== idInsumo));
  };

  const agregarQuimico = (idQuimico) => {
    const quimico = quimicosDisponibles.find(q => q.idQuimico === parseInt(idQuimico));
    if (quimico && !quimicosSeleccionados.find(q => q.idQuimico === quimico.idQuimico)) {
      setQuimicosSeleccionados([...quimicosSeleccionados, quimico]);
    }
  };

  const quitarQuimico = (idQuimico) => {
    setQuimicosSeleccionados(quimicosSeleccionados.filter(q => q.idQuimico !== idQuimico));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Validaciones
      if (!formEntrega.idPedido) {
        throw new Error('Debe seleccionar un pedido');
      }

      if (!formEntrega.idEstudiante) {
        throw new Error('Debe seleccionar un estudiante');
      }

      if (insumosSeleccionados.length === 0 && quimicosSeleccionados.length === 0) {
        throw new Error('Debe agregar al menos un insumo o químico');
      }

      // 1. Crear la entrega
      const entregaData = {
        fechaEntrega: formEntrega.fechaEntrega,
        horaEntrega: formEntrega.horaEntrega,
        pedido: { idPedido: parseInt(formEntrega.idPedido) },
        estudiante: { idEstudiante: parseInt(formEntrega.idEstudiante) }
      };

      const entregaResponse = await entregaService.createEntrega(entregaData);
      const entregaId = entregaResponse.data.idEntrega;
      setEntregaCreada(entregaResponse.data);

      // 2. Agregar insumos a la entrega
      for (const insumo of insumosSeleccionados) {
        await entregaService.agregarInsumo({
          entrega: { idEntrega: entregaId },
          insumo: { idInsumo: insumo.idInsumo }
        });
      }

      // 3. Agregar químicos a la entrega
      for (const quimico of quimicosSeleccionados) {
        await entregaService.agregarQuimico({
          entrega: { idEntrega: entregaId },
          quimico: { idQuimico: quimico.idQuimico }
        });
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Error al crear entrega:', error);
      setErrorMessage(error.response?.data || error.message || 'No se pudo crear la entrega');
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Nueva Entrega</h2>
            <p className="text-gray-500 dark:text-gray-400">Complete el formulario para registrar una nueva entrega.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información General */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    id="fechaEntrega"
                    name="fechaEntrega"
                    value={formEntrega.fechaEntrega}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="horaEntrega" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora de Entrega *
                  </label>
                  <input
                    type="datetime-local"
                    id="horaEntrega"
                    name="horaEntrega"
                    value={formEntrega.horaEntrega}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="idPedido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pedido *
                  </label><select
                    id="idPedido"
                    name="idPedido"
                    value={formEntrega.idPedido}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar pedido</option>
                    {pedidos.map(pedido => (
                      <option key={pedido.idPedido} value={pedido.idPedido}>
                        #PED{String(pedido.idPedido).padStart(3, '0')} - {pedido.curso?.nombreCurso || 'Sin curso'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idEstudiante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estudiante *
                  </label>
                  <select
                    id="idEstudiante"
                    name="idEstudiante"
                    value={formEntrega.idEstudiante}
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
              </div>
            </div>

            {/* Insumos */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Insumos Físicos</h3>
              
              <div className="mb-4">
                <label htmlFor="agregarInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agregar Insumo
                </label>
                <div className="flex gap-2">
                  <select
                    id="agregarInsumo"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                    onChange={(e) => {
                      if (e.target.value) {
                        agregarInsumo(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Seleccionar insumo disponible</option>
                    {insumosDisponibles
                      .filter(insumo => !insumosSeleccionados.find(i => i.idInsumo === insumo.idInsumo))
                      .map(insumo => (
                        <option key={insumo.idInsumo} value={insumo.idInsumo}>
                          #{insumo.idInsumo} - {insumo.tipoInsumo?.nombreTipoInsumo || 'Sin nombre'}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Lista de insumos seleccionados */}
              {insumosSeleccionados.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Insumos seleccionados ({insumosSeleccionados.length})
                  </p>
                  {insumosSeleccionados.map(insumo => (
                    <div key={insumo.idInsumo} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {insumo.tipoInsumo?.nombreTipoInsumo || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: #{insumo.idInsumo}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitarInsumo(insumo.idInsumo)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No se han agregado insumos físicos
                </p>
              )}
            </div>

            {/* Químicos */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Químicos</h3>
              
              <div className="mb-4">
                <label htmlFor="agregarQuimico" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agregar Químico
                </label>
                <div className="flex gap-2">
                  <select
                    id="agregarQuimico"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                    onChange={(e) => {
                      if (e.target.value) {
                        agregarQuimico(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Seleccionar químico disponible</option>
                    {quimicosDisponibles
                      .filter(quimico => !quimicosSeleccionados.find(q => q.idQuimico === quimico.idQuimico))
                      .map(quimico => (
                        <option key={quimico.idQuimico} value={quimico.idQuimico}>
                          #{quimico.idQuimico} - {quimico.tipoInsumo?.nombreTipoInsumo || 'Sin nombre'} ({quimico.cantQuimico} {quimico.tipoInsumo?.unidad?.unidad})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Lista de químicos seleccionados */}
              {quimicosSeleccionados.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Químicos seleccionados ({quimicosSeleccionados.length})
                  </p>
                  {quimicosSeleccionados.map(quimico => (
                    <div key={quimico.idQuimico} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {quimico.tipoInsumo?.nombreTipoInsumo || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cantidad: {quimico.cantQuimico} {quimico.tipoInsumo?.unidad?.unidad}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitarQuimico(quimico.idQuimico)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No se han agregado químicos
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/entregas')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Registrar Entrega'}
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
                ¡Entrega Registrada con Éxito!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                La entrega #ENT{String(entregaCreada?.idEntrega || 0).padStart(3, '0')} ha sido registrada correctamente.
              </p>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate(`/entregas/${entregaCreada?.idEntrega}`)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Ver Detalle
                </button>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/entregas');
                  }}
                  className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
                >
                  Ir a Entregas
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
                Error al Registrar Entrega
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {errorMessage || 'No se pudo registrar la entrega. Por favor, intente nuevamente.'}
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

export default NuevaEntrega;
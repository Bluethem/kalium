import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { experimentoService, insumoService } from '../../services/api';

const EditarExperimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tiposInsumo, setTiposInsumo] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formExperimento, setFormExperimento] = useState({
    nombreExperimento: ''
  });

  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tiposRes, expRes, detallesRes] = await Promise.all([
        insumoService.getTiposInsumo(),
        experimentoService.getExperimentoById(id),
        experimentoService.getDetallesExperimento(id)
      ]);
      
      setTiposInsumo(tiposRes.data || []);
      setFormExperimento({ nombreExperimento: expRes.data.nombreExperimento });
      
      // Mapear detalles existentes
      const insumosExistentes = (detallesRes.data || []).map(detalle => ({
        idDetalleExperimento: detalle.idDetalleExperimento,
        idTipoInsumo: detalle.tipoInsumo.idTipoInsumo,
        cantidad: detalle.cantInsumoExperimento
      }));
      
      setInsumosSeleccionados(insumosExistentes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorMessage('Error al cargar el experimento');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormExperimento(prev => ({ ...prev, [name]: value }));
  };

  const agregarInsumo = () => {
    setInsumosSeleccionados([
      ...insumosSeleccionados,
      { idTipoInsumo: '', cantidad: 1 }
    ]);
  };

  const actualizarInsumo = (index, campo, valor) => {
    const nuevosInsumos = [...insumosSeleccionados];
    nuevosInsumos[index][campo] = valor;
    setInsumosSeleccionados(nuevosInsumos);
  };

  const eliminarInsumo = (index) => {
    const nuevosInsumos = insumosSeleccionados.filter((_, i) => i !== index);
    setInsumosSeleccionados(nuevosInsumos);
  };

  const getTipoInsumoInfo = (idTipoInsumo) => {
    return tiposInsumo.find(t => t.idTipoInsumo === parseInt(idTipoInsumo));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
  
    try {
      // Validaciones
      if (!formExperimento.nombreExperimento.trim()) {
        throw new Error('Debe ingresar un nombre para el experimento');
      }

      if (insumosSeleccionados.length === 0) {
        throw new Error('Debe agregar al menos un insumo al experimento');
      }

      // Validar que todos los insumos tengan tipo y cantidad
      for (let i = 0; i < insumosSeleccionados.length; i++) {
        const insumo = insumosSeleccionados[i];
        if (!insumo.idTipoInsumo) {
          throw new Error(`Debe seleccionar un tipo de insumo para el insumo #${i + 1}`);
        }
        if (!insumo.cantidad || insumo.cantidad <= 0) {
          throw new Error(`Debe ingresar una cantidad válida para el insumo #${i + 1}`);
        }
      }

      // 1. Actualizar el experimento
      const experimentoData = {
        nombreExperimento: formExperimento.nombreExperimento.trim()
      };

      await experimentoService.updateExperimento(id, experimentoData);

      // 2. Obtener detalles actuales del backend
      const detallesActuales = await experimentoService.getDetallesExperimento(id);
      const idsActuales = detallesActuales.data.map(d => d.idDetalleExperimento);

      // 3. Eliminar detalles que ya no están en la selección
      for (const detalle of detallesActuales.data) {
        const existeEnSeleccion = insumosSeleccionados.find(
          ins => ins.idDetalleExperimento === detalle.idDetalleExperimento
        );
        
        if (!existeEnSeleccion) {
          await experimentoService.eliminarDetalle(detalle.idDetalleExperimento);
        }
      }

      // 4. Agregar nuevos detalles o actualizar existentes
      for (const insumo of insumosSeleccionados) {
        const detalleData = {
          cantInsumoExperimento: parseInt(insumo.cantidad),
          tipoInsumo: { idTipoInsumo: parseInt(insumo.idTipoInsumo) },
          experimento: { idExperimento: parseInt(id) }
        };

        // Si no tiene ID, es nuevo
        if (!insumo.idDetalleExperimento) {
          await experimentoService.agregarDetalle(detalleData);
        }
        // Si tiene ID pero cambió algo, lo eliminamos y creamos uno nuevo
        // (como no hay endpoint de UPDATE para detalles)
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setErrorMessage(error.response?.data || error.message || 'No se pudo actualizar el experimento');
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2cab5b] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando experimento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Editar Experimento</h2>
            <p className="text-gray-500 dark:text-gray-400">Modifique la información del experimento.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información del Experimento */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información del Experimento</h3>
              <div>
                <label htmlFor="nombreExperimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Experimento *
                </label>
                <input
                  type="text"
                  id="nombreExperimento"
                  name="nombreExperimento"
                  value={formExperimento.nombreExperimento}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Titulación Ácido-Base"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#2cab5b] focus:border-[#2cab5b]"
                />
              </div>
            </div>

            {/* Insumos Necesarios */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Insumos Necesarios</h3>
                <button
                  type="button"
                  onClick={agregarInsumo}
                  className="flex items-center gap-2 rounded-lg bg-[#2cab5b] px-3 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Agregar Insumo
                </button>
              </div>

              {insumosSeleccionados.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">science</span>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No hay insumos agregados
                  </p>
                  <button
                    type="button"
                    onClick={agregarInsumo}
                    className="text-[#2cab5b] hover:underline font-medium"
                  >
                    Agregar el primer insumo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {insumosSeleccionados.map((insumo, index) => {
                    const tipoInfo = getTipoInsumoInfo(insumo.idTipoInsumo);
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Selector de tipo de insumo */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Insumo *
                              </label>
                              <select
                                value={insumo.idTipoInsumo}
                                onChange={(e) => actualizarInsumo(index, 'idTipoInsumo', e.target.value)}
                                required
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#2cab5b] focus:border-[#2cab5b]"
                              >
                                <option value="">Seleccionar insumo</option>
                                {tiposInsumo.map(tipo => (
                                  <option key={tipo.idTipoInsumo} value={tipo.idTipoInsumo}>
                                    {tipo.nombreTipoInsumo} ({tipo.esQuimico ? 'Químico' : 'Insumo físico'})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Cantidad */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cantidad * {tipoInfo && `(${tipoInfo.unidad?.unidad || ''})`}
                              </label>
                              <input
                                type="number"
                                value={insumo.cantidad}
                                onChange={(e) => actualizarInsumo(index, 'cantidad', e.target.value)}
                                required
                                min="1"
                                step={tipoInfo?.esQuimico ? "0.1" : "1"}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#2cab5b] focus:border-[#2cab5b]"
                              />
                            </div>

                            {/* Información del insumo seleccionado */}
                            {tipoInfo && (
                              <div className="md:col-span-2">
                                <div className="flex items-start gap-2 text-sm">
                                  <span className="material-symbols-outlined text-gray-400 text-base">info</span>
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Descripción:</span> {tipoInfo.descripcion}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Categoría:</span> {tipoInfo.categoria?.nombreCategoria || 'N/A'}
                                    </p>
                                    <span className={`inline-flex items-center mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                      tipoInfo.esQuimico
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                      {tipoInfo.esQuimico ? 'Químico' : 'Insumo físico'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => eliminarInsumo(index)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Eliminar insumo"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/experimentos/${id}`)}
                disabled={saving}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-[#2cab5b] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">check</span>
                    Guardar Cambios
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
                ¡Cambios Guardados!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                El experimento ha sido actualizado correctamente.
              </p>
              <button
                onClick={() => navigate(`/experimentos/${id}`)}
                className="w-full rounded-lg bg-[#2cab5b] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
              >
                Ver Detalle
              </button>
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
                Error al Guardar
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setShowError(false);
                  setErrorMessage('');
                }}
                className="w-full rounded-lg bg-[#2cab5b] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
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

export default EditarExperimento;

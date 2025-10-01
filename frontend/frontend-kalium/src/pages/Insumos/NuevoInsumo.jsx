import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { insumoService, quimicoService } from '../../services/api';
import axios from 'axios';

const NuevoInsumo = () => {
  const navigate = useNavigate();
  const [tipoSeleccionado, setTipoSeleccionado] = useState('fisico');
  const [tiposInsumo, setTiposInsumo] = useState([]);
  const [estadosInsumo, setEstadosInsumo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accionRealizada, setAccionRealizada] = useState('');
  
  // Form data para insumo físico
  const [formInsumo, setFormInsumo] = useState({
    idTipoInsumo: '',
    idEstInsumo: '',
    fechaIngreso: new Date().toISOString().split('T')[0]
  });

  // Form data para químico
  const [formQuimico, setFormQuimico] = useState({
    idTipoInsumo: '',
    cantQuimico: '',
    fechaIngreso: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [tiposRes, estadosRes] = await Promise.all([
        insumoService.getTiposInsumo(),
        axios.get('http://localhost:8080/api/estados-insumo')
      ]);
      setTiposInsumo(tiposRes.data);
      setEstadosInsumo(estadosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChangeInsumo = (e) => {
    const { name, value } = e.target;
    setFormInsumo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangeQuimico = (e) => {
    const { name, value } = e.target;
    setFormQuimico(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitInsumo = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const insumoData = {
        estInsumo: { idEstInsumo: parseInt(formInsumo.idEstInsumo) },
        tipoInsumo: { idTipoInsumo: parseInt(formInsumo.idTipoInsumo) },
        fechaIngreso: formInsumo.fechaIngreso
      };
  
      await insumoService.createInsumo(insumoData);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error al crear insumo:', error);
      setErrorMessage(error.response?.data || error.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitQuimico = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const quimicoData = {
        cantQuimico: parseFloat(formQuimico.cantQuimico),
        tipoInsumo: { idTipoInsumo: parseInt(formQuimico.idTipoInsumo) },
        fechaIngreso: formQuimico.fechaIngreso
      };
  
      await quimicoService.createQuimico(quimicoData);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error al crear químico:', error);
      setErrorMessage(error.response?.data || error.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tipos de insumo según el tipo seleccionado
  const tiposFiltrados = tiposInsumo.filter(tipo => 
    tipoSeleccionado === 'fisico' ? !tipo.esQuimico : tipo.esQuimico
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
              Agregar Insumo / Químico
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            {/* Radio buttons para seleccionar tipo */}
            <div className="mb-6">
              <fieldset className="flex justify-center gap-x-8">
                <legend className="sr-only">Tipo de Insumo</legend>
                
                <div>
                  <input
                    type="radio"
                    id="insumo_fisico"
                    name="tipo_insumo"
                    value="fisico"
                    checked={tipoSeleccionado === 'fisico'}
                    onChange={(e) => setTipoSeleccionado(e.target.value)}
                    className="peer hidden"
                  />
                  <label
                    htmlFor="insumo_fisico"
                    className="cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-[#2cab5b] peer-checked:text-white peer-checked:border-[#2cab5b]"
                  >
                    Agregar Insumo Físico
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="insumo_quimico"
                    name="tipo_insumo"
                    value="quimico"
                    checked={tipoSeleccionado === 'quimico'}
                    onChange={(e) => setTipoSeleccionado(e.target.value)}
                    className="peer hidden"
                  />
                  <label
                    htmlFor="insumo_quimico"
                    className="cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-[#2cab5b] peer-checked:text-white peer-checked:border-[#2cab5b]"
                  >
                    Agregar Químico
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Formulario para Insumo Físico */}
            {tipoSeleccionado === 'fisico' && (
              <form onSubmit={handleSubmitInsumo} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="id-insumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID del Insumo
                    </label>
                    <input
                      type="text"
                      id="id-insumo"
                      disabled
                      placeholder="Autogenerado"
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo-insumo-fisico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Insumo
                    </label>
                    <select
                      id="tipo-insumo-fisico"
                      name="idTipoInsumo"
                      value={formInsumo.idTipoInsumo}
                      onChange={handleChangeInsumo}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm rounded-md"
                    >
                      <option value="">Seleccionar tipo</option>
                      {tiposFiltrados.map(tipo => (
                        <option key={tipo.idTipoInsumo} value={tipo.idTipoInsumo}>
                          {tipo.nombreTipoInsumo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estado-insumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado
                    </label>
                    <select
                      id="estado-insumo"
                      name="idEstInsumo"
                      value={formInsumo.idEstInsumo}
                      onChange={handleChangeInsumo}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm rounded-md"
                    >
                      <option value="">Seleccionar estado</option>
                      {estadosInsumo.map(estado => (
                        <option key={estado.idEstInsumo} value={estado.idEstInsumo}>
                          {estado.nombreEstInsumo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fecha-ingreso-fisico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de Ingreso
                    </label>
                    <input
                      type="date"
                      id="fecha-ingreso-fisico"
                      name="fechaIngreso"
                      value={formInsumo.fechaIngreso}
                      onChange={handleChangeInsumo}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/insumos')}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14378f]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(44,171,91)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(44,171,91)] disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {/* Formulario para Químico */}
            {tipoSeleccionado === 'quimico' && (
              <form onSubmit={handleSubmitQuimico} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="id-quimico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID del Químico
                    </label>
                    <input
                      type="text"
                      id="id-quimico"
                      disabled
                      placeholder="Autogenerado"
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo-quimico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Químico
                    </label>
                    <select
                      id="tipo-quimico"
                      name="idTipoInsumo"
                      value={formQuimico.idTipoInsumo}
                      onChange={handleChangeQuimico}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm rounded-md"
                    >
                      <option value="">Seleccionar tipo</option>
                      {tiposFiltrados.map(tipo => (
                        <option key={tipo.idTipoInsumo} value={tipo.idTipoInsumo}>
                          {tipo.nombreTipoInsumo} ({tipo.unidad?.unidad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cantidad-quimico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="cantidad-quimico"
                      name="cantQuimico"
                      value={formQuimico.cantQuimico}
                      onChange={handleChangeQuimico}
                      min="0"
                      required
                      placeholder="Ej: 500.5"
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formQuimico.idTipoInsumo && tiposFiltrados.find(t => t.idTipoInsumo === parseInt(formQuimico.idTipoInsumo))?.unidad?.unidad}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="fecha-ingreso-quimico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de Ingreso
                    </label>
                    <input
                      type="date"
                      id="fecha-ingreso-quimico"
                      name="fechaIngreso"
                      value={formQuimico.fechaIngreso}
                      onChange={handleChangeQuimico}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/insumos')}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14378f]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(44,171,91)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(44,171,91)] disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal de Éxito */}
            {showSuccess && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                      <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-500">
                        check_circle
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {tipoSeleccionado === 'quimico' ? 'Químico registrado con éxito' : 'Insumo registrado con éxito'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {tipoSeleccionado === 'quimico' 
                        ? 'El nuevo químico ha sido agregado a tu inventario.' 
                        : 'El nuevo insumo ha sido agregado a tu inventario.'}
                    </p>
                    <button
                      onClick={() => {
                        setShowSuccess(false);
                        navigate('/insumos');
                      }}
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(44,171,91)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(44,171,91)]"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Error */}
            {showError && (
              <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/75 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-500 text-3xl">
                      error_outline
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Error al agregar {tipoSeleccionado === 'quimico' ? 'químico' : 'insumo'}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        No se pudo registrar {tipoSeleccionado === 'quimico' ? 'el químico' : 'el insumo'} en el inventario. 
                        Por favor, verifique los datos e intente nuevamente.
                      </p>
                      {errorMessage && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={() => setShowError(false)}
                      className="inline-flex justify-center rounded-md border border-transparent bg-[rgb(44,171,91)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(44,171,91)] focus:ring-offset-2"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={() => {
                        setShowError(false);
                        setErrorMessage('');
                      }}
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevoInsumo;
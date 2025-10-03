import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { pedidoService, insumoService } from '../../services/api';
import axios from 'axios';

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instructores, setInstructores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [tiposPedido, setTiposPedido] = useState([]);
  const [tiposInsumo, setTiposInsumo] = useState([]);
  
  // Modales
  const [showErrorStock, setShowErrorStock] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formPedido, setFormPedido] = useState({
    fechaPedido: new Date().toISOString().split('T')[0],
    cantGrupos: 1,
    idInstructor: '',
    idCurso: '',
    idTipoPedido: '',
    fechaEntrega: '',
    horaEntrega: ''
  });

  const [items, setItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({
    idTipoInsumo: '',
    cantInsumo: 1,
    esQuimico: false
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [instructoresRes, cursosRes, tiposPedidoRes, tiposInsumoRes] = await Promise.all([
        axios.get('http://localhost:8080/api/instructores'),
        axios.get('http://localhost:8080/api/cursos'),
        axios.get('http://localhost:8080/api/tipos-pedido'),
        insumoService.getTiposInsumoConStock()
      ]);
      
      setInstructores(instructoresRes.data || []);
      setCursos(cursosRes.data || []);
      setTiposPedido(tiposPedidoRes.data || []);
      setTiposInsumo(tiposInsumoRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChangePedido = (e) => {
    const { name, value } = e.target;
    setFormPedido(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeItem = (e) => {
    const { name, value } = e.target;
    
    if (name === 'idTipoInsumo') {
      const tipoSeleccionado = tiposInsumo.find(t => t.idTipoInsumo === parseInt(value));
      setNuevoItem(prev => ({ 
        ...prev, 
        [name]: value,
        esQuimico: tipoSeleccionado?.esQuimico || false
      }));
    } else {
      setNuevoItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const agregarItem = () => {
    if (!nuevoItem.idTipoInsumo || !nuevoItem.cantInsumo) {
      alert('Complete todos los campos del ítem');
      return;
    }

    const tipoInsumo = tiposInsumo.find(t => t.idTipoInsumo === parseInt(nuevoItem.idTipoInsumo));
    
    // Validar stock disponible
    const cantidadDisponible = parseFloat(tipoInsumo.cantidadNumerica || 0);
    const cantidadSolicitada = parseFloat(nuevoItem.cantInsumo);
    
    if (cantidadSolicitada > cantidadDisponible) {
      setErrorMessage(`Stock insuficiente. Disponible: ${tipoInsumo.cantidadTotal} ${tipoInsumo.unidad?.unidad}`);
      setShowErrorStock(true);
      return;
    }
    
    setItems(prev => [...prev, {
      ...nuevoItem,
      nombreTipoInsumo: tipoInsumo.nombreTipoInsumo,
      unidad: tipoInsumo.unidad?.unidad
    }]);

    setNuevoItem({ idTipoInsumo: '', cantInsumo: 1, esQuimico: false });
  };

  const eliminarItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (items.length === 0) {
        throw new Error('Debe agregar al menos un ítem al pedido');
      }

      // Crear el pedido
      const pedidoData = {
        fechaPedido: formPedido.fechaPedido,
        cantGrupos: parseInt(formPedido.cantGrupos),
        instructor: { idInstructor: parseInt(formPedido.idInstructor) },
        estPedido: { idEstPedido: 1 }, // Pendiente
        curso: { idCurso: parseInt(formPedido.idCurso) },
        tipoPedido: { idTipoPedido: parseInt(formPedido.idTipoPedido) },
        horario: {
          fechaEntrega: formPedido.fechaEntrega,
          horaInicio: formPedido.horaEntrega
        }
      };

      const pedidoRes = await pedidoService.createPedido(pedidoData);
      
      // Crear detalles del pedido
      for (const item of items) {
        await axios.post('http://localhost:8080/api/pedidos-detalle', {
          cantInsumo: parseInt(item.cantInsumo),
          pedido: { idPedido: pedidoRes.data.idPedido },
          tipoInsumo: { idTipoInsumo: parseInt(item.idTipoInsumo) }
        });
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setErrorMessage(error.response?.data || error.message || 'No se pudo crear el pedido');
      setShowErrorStock(true);
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Nuevo Pedido</h2>
            <p className="text-gray-500 dark:text-gray-400">Complete el formulario para registrar un nuevo pedido.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información del Pedido */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información del Pedido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fechaPedido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha del Pedido
                  </label>
                  <input
                    type="date"
                    id="fechaPedido"
                    name="fechaPedido"
                    value={formPedido.fechaPedido}
                    onChange={handleChangePedido}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="cantGrupos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cantidad de Grupos
                  </label>
                  <input
                    type="number"
                    id="cantGrupos"
                    name="cantGrupos"
                    value={formPedido.cantGrupos}
                    onChange={handleChangePedido}
                    min="1"
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <label htmlFor="idInstructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instructor
                  </label>
                  <select
                    id="idInstructor"
                    name="idInstructor"
                    value={formPedido.idInstructor}
                    onChange={handleChangePedido}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar instructor</option>
                    {instructores.map(inst => (
                      <option key={inst.idInstructor} value={inst.idInstructor}>
                        {inst.usuario?.nombre} {inst.usuario?.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idCurso" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Curso
                  </label>
                  <select
                    id="idCurso"
                    name="idCurso"
                    value={formPedido.idCurso}
                    onChange={handleChangePedido}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map(curso => (
                      <option key={curso.idCurso} value={curso.idCurso}>
                        {curso.nombreCurso}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idTipoPedido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Pedido
                  </label>
                  <select
                    id="idTipoPedido"
                    name="idTipoPedido"
                    value={formPedido.idTipoPedido}
                    onChange={handleChangePedido}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposPedido.map(tipo => (
                      <option key={tipo.idTipoPedido} value={tipo.idTipoPedido}>
                        {tipo.nombrePedido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="horaEntrega" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horario de Entrega
                  </label>
                  <input
                    type="datetime-local"
                    id="horaEntrega"
                    name="horaEntrega"
                    value={formPedido.horaEntrega}
                    onChange={handleChangePedido}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>
              </div>
            </div>

            {/* Insumos y Químicos */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Insumos y Químicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-6">
                <div>
                  <label htmlFor="idTipoInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Insumo
                  </label>
                  <select
                    id="idTipoInsumo"
                    name="idTipoInsumo"
                    value={nuevoItem.idTipoInsumo}
                    onChange={handleChangeItem}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  >
                    <option value="">Seleccionar</option>
                    {tiposInsumo.map(tipo => (
                      <option key={tipo.idTipoInsumo} value={tipo.idTipoInsumo}>
                        {tipo.nombreTipoInsumo} ({tipo.esQuimico ? 'Químico' : 'Físico'}) - Disponible: {tipo.cantidadTotal}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cantInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    id="cantInsumo"
                    name="cantInsumo"
                    value={nuevoItem.cantInsumo}
                    onChange={handleChangeItem}
                    min="1"
                    step={nuevoItem.esQuimico ? "0.01" : "1"}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={agregarItem}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[rgb(44,171,91)]/10 px-4 py-2 text-sm font-semibold text-[rgb(44,171,91)] hover:bg-[rgb(44,171,91)]/20 dark:text-white"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Añadir Ítem
                  </button>
                </div>
              </div>

              {/* Tabla de items agregados */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Insumo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay ítems agregados al pedido
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {item.nombreTipoInsumo}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.esQuimico ? 'Químico' : 'Físico'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.cantInsumo} {item.unidad}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => eliminarItem(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/pedidos')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Pedido'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de Error - Stock Insuficiente */}
      {showErrorStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-md text-center border border-gray-200 dark:border-gray-800">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">error</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error al añadir el ítem
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {errorMessage || 'El stock del producto seleccionado es insuficiente.'}
            </p>
            <button
              onClick={() => {
                setShowErrorStock(false);
                setErrorMessage('');
              }}
              className="w-full rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(44,171,91)]"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

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
                ¡Pedido Registrado con Éxito!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Tu pedido ha sido enviado y será procesado a la brevedad.
              </p>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/pedidos');
                  }}
                  className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => navigate('/pedidos')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Ir a Mis Pedidos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoPedido;
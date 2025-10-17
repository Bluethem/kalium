import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { pedidoService, insumoService, horarioService, pedidoDetalleService } from '../../services/api';
import axios from 'axios';

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instructores, setInstructores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [tiposPedido, setTiposPedido] = useState([]);
  const [tiposInsumo, setTiposInsumo] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horariosAgrupados, setHorariosAgrupados] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);

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
    horaEntrega: '08:00' // Hora por defecto
  });

  const [items, setItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({
    idTipoInsumo: '',
    cantPorGrupo: 1, // Cantidad por grupo
    esQuimico: false
  });

  const agruparHorariosPorFecha = (horarios = []) => {
    const mapa = horarios.reduce((acc, horario) => {
      if (!horario?.fechaEntrega) {
        return acc;
      }
      if (!acc[horario.fechaEntrega]) {
        acc[horario.fechaEntrega] = [];
      }
      acc[horario.fechaEntrega].push(horario);
      return acc;
    }, {});

    return Object.entries(mapa)
      .sort((a, b) => new Date(`${a[0]}T00:00:00`) - new Date(`${b[0]}T00:00:00`))
      .map(([fecha, slots]) => {
        const fechaLegibleRaw = new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'short'
        });
        const fechaLegible = fechaLegibleRaw.charAt(0).toUpperCase() + fechaLegibleRaw.slice(1);

        return {
          fecha,
          fechaLegible,
          slots: slots.sort((slotA, slotB) => new Date(slotA.horaInicio) - new Date(slotB.horaInicio))
        };
      });
  };

  const recargarHorarios = async () => {
    try {
      setLoadingHorarios(true);
      const response = await horarioService.getHorariosDisponibles();
      const disponibles = response.data || [];
      setHorariosDisponibles(disponibles);
      setHorariosAgrupados(agruparHorariosPorFecha(disponibles));
      setSelectedHorario(prev => {
        if (!prev) {
          return prev;
        }
        const match = disponibles.find(h => h.idHorario === prev.idHorario);
        return match || null;
      });
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error);
    } finally {
      setLoadingHorarios(false);
    }
  };

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

      await recargarHorarios();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChangePedido = (e) => {
    const { name, value } = e.target;
    const actualizado = { ...formPedido, [name]: value };
    setFormPedido(actualizado);

    if (selectedHorario && (name === 'fechaEntrega' || name === 'horaEntrega')) {
      const horaSeleccionada = selectedHorario.horaInicio?.substring(11, 16);
      if (
        selectedHorario.fechaEntrega !== actualizado.fechaEntrega ||
        horaSeleccionada !== actualizado.horaEntrega
      ) {
        setSelectedHorario(null);
      }
    }
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

  const handleSeleccionHorario = (horario) => {
    if (!horario) {
      return;
    }

    const horaFormateada = horario.horaInicio?.substring(11, 16) || formPedido.horaEntrega;

    setSelectedHorario(horario);
    setFormPedido(prev => ({
      ...prev,
      fechaEntrega: horario.fechaEntrega,
      horaEntrega: horaFormateada
    }));
  };

  const agregarItem = () => {
    if (!nuevoItem.idTipoInsumo) {
      alert('Seleccione un tipo de insumo');
      return;
    }

    const tipoInsumo = tiposInsumo.find(t => t.idTipoInsumo === parseInt(nuevoItem.idTipoInsumo));
    
    // Calcular cantidad total (cantPorGrupo × cantGrupos)
    // Si no ingresó cantidad, usar 1 por defecto
    const cantPorGrupo = parseFloat(nuevoItem.cantPorGrupo) || 1;
    const cantGrupos = parseInt(formPedido.cantGrupos) || 1;
    const cantidadTotal = cantPorGrupo * cantGrupos;
    
    // Validar stock disponible contra la cantidad TOTAL
    const cantidadDisponible = parseFloat(tipoInsumo.cantidadNumerica || 0);
    
    if (cantidadTotal > cantidadDisponible) {
      setErrorMessage(`Stock insuficiente. Necesitas: ${cantidadTotal} ${tipoInsumo.unidad?.unidad} (${cantPorGrupo} × ${cantGrupos} grupos). Disponible: ${tipoInsumo.cantidadTotal} ${tipoInsumo.unidad?.unidad}`);
      setShowErrorStock(true);
      return;
    }
    
    setItems(prev => [...prev, {
      idTipoInsumo: nuevoItem.idTipoInsumo,
      cantPorGrupo: cantPorGrupo, // Guardar la cantidad usada (puede ser default 1)
      cantidadTotal: cantidadTotal, // Para guardar en backend
      nombreTipoInsumo: tipoInsumo.nombreTipoInsumo,
      unidad: tipoInsumo.unidad?.unidad,
      esQuimico: nuevoItem.esQuimico
    }]);

    setNuevoItem({ idTipoInsumo: '', cantPorGrupo: 1, esQuimico: false });
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
  
      let idHorarioAsignado = selectedHorario?.idHorario || null;

      if (!idHorarioAsignado) {
        if (!formPedido.fechaEntrega || !formPedido.horaEntrega) {
          throw new Error('Seleccione un horario disponible o ingrese la fecha y hora de entrega');
        }

        // ✅ PASO 1: Crear el horario cuando no se seleccionó uno existente
        const horarioData = {
          fechaEntrega: formPedido.fechaEntrega, // LocalDate: "2025-01-20"
          horaInicio: `${formPedido.fechaEntrega}T${formPedido.horaEntrega}:00` // LocalDateTime: "2025-01-20T14:30:00"
        };

        const horarioRes = await horarioService.createHorario(horarioData);
        idHorarioAsignado = horarioRes.data.idHorario;
      }

      // ✅ PASO 2: Crear el pedido con el ID del horario
      const pedidoData = {
        fechaPedido: formPedido.fechaPedido,
        cantGrupos: parseInt(formPedido.cantGrupos),
        instructor: { idInstructor: parseInt(formPedido.idInstructor) },
        estPedido: { idEstPedido: 1 }, // Pendiente
        curso: { idCurso: parseInt(formPedido.idCurso) },
        tipoPedido: { idTipoPedido: parseInt(formPedido.idTipoPedido) },
        horario: { idHorario: idHorarioAsignado } // ✅ Usar el ID existente o generado
      };

      const pedidoRes = await pedidoService.createPedido(pedidoData);

      // ✅ PASO 3: Crear detalles del pedido
      for (const item of items) {
        await pedidoDetalleService.createPedidoDetalle({
          cantInsumo: parseFloat(item.cantidadTotal), // Usar la cantidad total ya calculada
          pedido: { idPedido: pedidoRes.data.idPedido },
          tipoInsumo: { idTipoInsumo: parseInt(item.idTipoInsumo) },
          estPedidoDetalle: { idEstPedidoDetalle: 1 } // 1 = Pendiente
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
              </div>
            </div>

            {/* Insumos y Químicos */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Insumos y Químicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
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
                      <option value="">Seleccionar insumo</option>
                      {tiposInsumo.map(tipo => (
                        <option key={tipo.idTipoInsumo} value={tipo.idTipoInsumo}>
                          {tipo.nombreTipoInsumo} ({tipo.esQuimico ? 'Químico' : 'Físico'}) - Disp: {tipo.cantidadTotal}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cantPorGrupo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad por Grupo
                    </label>
                    <input
                      type="number"
                      id="cantPorGrupo"
                      name="cantPorGrupo"
                      value={nuevoItem.cantPorGrupo}
                      onChange={handleChangeItem}
                      min="0.01"
                      step={nuevoItem.esQuimico ? "0.01" : "1"}
                      placeholder="Ej: 2"
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Total a pedir:</span>
                    <span className="block text-lg font-bold text-[rgb(44,171,91)] dark:text-white">
                      {(parseFloat(nuevoItem.cantPorGrupo) * parseInt(formPedido.cantGrupos) || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={agregarItem}
                    disabled={!nuevoItem.idTipoInsumo}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Añadir
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
                        Cant/Grupo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
                            {item.cantPorGrupo} {item.unidad}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                            {item.cantidadTotal} {item.unidad}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({item.cantPorGrupo} × {formPedido.cantGrupos})</span>
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

            {/* Selección de horario */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Horario de Entrega</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Selecciona un bloque disponible. La fecha y hora se completarán automáticamente según tu elección.
              </p>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedHorario ? (
                    <span>
                      Horario seleccionado:&nbsp;
                      <strong>{new Date(selectedHorario.horaInicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
                      &nbsp;–&nbsp;
                      <strong>{new Date(selectedHorario.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong>
                    </span>
                  ) : (
                    <span>No hay horario seleccionado.</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={recargarHorarios}
                  disabled={loadingHorarios}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  {loadingHorarios ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>

              {loadingHorarios ? (
                <div className="mt-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Cargando horarios disponibles...
                </div>
              ) : horariosAgrupados.length === 0 ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    No hay horarios libres registrados. Ingresa un nuevo bloque manualmente.
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {horariosAgrupados.map(grupo => (
                    <div
                      key={grupo.fecha}
                      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 p-4"
                    >
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{grupo.fechaLegible}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bloques disponibles</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {grupo.slots.map(slot => {
                          const isSelected = selectedHorario?.idHorario === slot.idHorario;
                          const horaLegible = new Date(slot.horaInicio).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <button
                              key={slot.idHorario}
                              type="button"
                              onClick={() => handleSeleccionHorario(slot)}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                isSelected
                                  ? 'border-[rgb(44,171,91)] bg-[rgb(44,171,91)] text-white shadow'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-[rgb(44,171,91)]'
                              }`}
                            >
                              {horaLegible}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
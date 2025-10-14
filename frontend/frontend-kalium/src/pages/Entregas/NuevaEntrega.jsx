import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { entregaService, pedidoService, estudianteService, insumoService, quimicoService } from '../../services/api';

const NuevaEntrega = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pedidoIdParam = searchParams.get('pedido');

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [entregasExistentes, setEntregasExistentes] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [entregaCreada, setEntregaCreada] = useState(null);
  
  const [insumosDisponibles, setInsumosDisponibles] = useState({});
  const [quimicosDisponibles, setQuimicosDisponibles] = useState({});
  const [insumosSeleccionados, setInsumosSeleccionados] = useState({});
  const [quimicosSeleccionados, setQuimicosSeleccionados] = useState({});
  
  const [formEntrega, setFormEntrega] = useState({
    fechaEntrega: new Date().toISOString().split('T')[0],
    horaEntrega: new Date().toISOString().slice(0, 16),
    idPedido: pedidoIdParam || '',
    idEstudiante: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formEntrega.idPedido) {
      cargarDetallesPedido(formEntrega.idPedido);
      verificarEntregasExistentes(formEntrega.idPedido);
    } else {
      setDetallesPedido([]);
      setPedidoSeleccionado(null);
      setInsumosSeleccionados({});
      setQuimicosSeleccionados({});
      setEntregasExistentes([]);
    }
  }, [formEntrega.idPedido]);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, estudiantesRes, entregasRes] = await Promise.all([
        pedidoService.getPedidos(),
        estudianteService.getEstudiantes(),
        entregaService.getEntregas()
      ]);
      
      // Obtener IDs de pedidos que ya tienen entregas
      const pedidosConEntrega = new Set(
        (entregasRes.data || []).map(e => e.pedido?.idPedido)
      );
      
      // Filtrar pedidos: Aprobados (2) o En Preparación (3) y SIN entregas
      const pedidosDisponibles = (pedidosRes.data || []).filter(
        p => (p.estPedido?.idEstPedido === 2 || p.estPedido?.idEstPedido === 3) 
          && !pedidosConEntrega.has(p.idPedido)
      );
      
      setPedidos(pedidosDisponibles);
      setEstudiantes(estudiantesRes.data || []);

      if (pedidoIdParam && pedidosDisponibles.some(p => p.idPedido === parseInt(pedidoIdParam))) {
        setFormEntrega(prev => ({ ...prev, idPedido: pedidoIdParam }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorMessage('Error al cargar los datos iniciales');
      setShowError(true);
    }
  };

  const verificarEntregasExistentes = async (idPedido) => {
    try {
      const response = await entregaService.getEntregasPorPedido(idPedido);
      setEntregasExistentes(response.data || []);
    } catch (error) {
      console.error('Error al verificar entregas:', error);
      setEntregasExistentes([]);
    }
  };

  const cargarDetallesPedido = async (idPedido) => {
    try {
      setLoadingPedido(true);
      const [pedidoRes, detallesRes] = await Promise.all([
        pedidoService.getPedidoById(idPedido),
        pedidoService.getDetallesPedido(idPedido)
      ]);
      
      setPedidoSeleccionado(pedidoRes.data);
      setDetallesPedido(detallesRes.data || []);
      await cargarInsumosDisponibles(detallesRes.data || []);
    } catch (error) {
      console.error('Error al cargar detalles del pedido:', error);
      setErrorMessage('Error al cargar los detalles del pedido');
      setShowError(true);
    } finally {
      setLoadingPedido(false);
    }
  };

  const cargarInsumosDisponibles = async (detalles) => {
    try {
      const insumosMap = {};
      const quimicosMap = {};
      
      for (const detalle of detalles) {
        const idTipoInsumo = detalle.tipoInsumo?.idTipoInsumo;
        const esQuimico = detalle.tipoInsumo?.esQuimico;
        
        if (!idTipoInsumo) continue;
        
        if (esQuimico) {
          const response = await quimicoService.getQuimicosPorTipo(idTipoInsumo);
          quimicosMap[idTipoInsumo] = response.data || [];
        } else {
          const response = await insumoService.getInsumosPorTipo(idTipoInsumo);
          insumosMap[idTipoInsumo] = (response.data || []).filter(
            i => i.estInsumo?.idEstInsumo === 1
          );
        }
      }
      
      setInsumosDisponibles(insumosMap);
      setQuimicosDisponibles(quimicosMap);
    } catch (error) {
      console.error('Error al cargar insumos disponibles:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEntrega(prev => ({ ...prev, [name]: value }));
  };

  const toggleInsumoSeleccionado = (idTipoInsumo, idInsumo) => {
    setInsumosSeleccionados(prev => {
      const key = idTipoInsumo;
      const current = prev[key] || [];
      
      if (current.includes(idInsumo)) {
        return { ...prev, [key]: current.filter(id => id !== idInsumo) };
      } else {
        return { ...prev, [key]: [...current, idInsumo] };
      }
    });
  };

  const toggleQuimicoSeleccionado = (idTipoInsumo, idQuimico) => {
    setQuimicosSeleccionados(prev => {
      const key = idTipoInsumo;
      const current = prev[key] || [];
      
      if (current.includes(idQuimico)) {
        return { ...prev, [key]: current.filter(id => id !== idQuimico) };
      } else {
        return { ...prev, [key]: [...current, idQuimico] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let entregaCreada = null;
  
    try {
      // Validaciones
      if (!formEntrega.idPedido) {
        throw new Error('Debe seleccionar un pedido');
      }

      if (!formEntrega.idEstudiante) {
        throw new Error('Debe seleccionar un estudiante');
      }

      const totalInsumos = Object.values(insumosSeleccionados).flat().length;
      const totalQuimicos = Object.values(quimicosSeleccionados).flat().length;
      
      if (totalInsumos === 0 && totalQuimicos === 0) {
        throw new Error('Debe seleccionar al menos un insumo o químico para entregar');
      }

      // Paso 1: Crear la entrega
      setLoadingMessage('Creando registro de entrega...');
      const entregaData = {
        fechaEntrega: formEntrega.fechaEntrega,
        horaEntrega: formEntrega.horaEntrega,
        pedido: { idPedido: parseInt(formEntrega.idPedido) },
        estudiante: { idEstudiante: parseInt(formEntrega.idEstudiante) }
      };

      console.log('📦 Creando entrega:', entregaData);
      const entregaResponse = await entregaService.createEntrega(entregaData);
      const entregaId = entregaResponse.data.idEntrega;
      entregaCreada = entregaResponse.data;
      console.log('✅ Entrega creada con ID:', entregaId);

      // Paso 2: Agregar insumos físicos
      const totalItems = totalInsumos + totalQuimicos;
      let itemsAgregados = 0;

      for (const idTipoInsumo in insumosSeleccionados) {
        const idsInsumos = insumosSeleccionados[idTipoInsumo];
        for (const idInsumo of idsInsumos) {
          itemsAgregados++;
          setLoadingMessage(`Agregando insumos... (${itemsAgregados}/${totalItems})`);
          
          await entregaService.crearEntregaInsumo({
            entrega: { idEntrega: entregaId },
            insumo: { idInsumo: parseInt(idInsumo) }
          });
          console.log(`✅ Insumo ${idInsumo} agregado`);
        }
      }

      // Paso 3: Agregar químicos
      for (const idTipoInsumo in quimicosSeleccionados) {
        const idsQuimicos = quimicosSeleccionados[idTipoInsumo];
        for (const idQuimico of idsQuimicos) {
          itemsAgregados++;
          setLoadingMessage(`Agregando químicos... (${itemsAgregados}/${totalItems})`);
          
          await entregaService.crearEntregaQuimico({
            entrega: { idEntrega: entregaId },
            quimico: { idQuimico: parseInt(idQuimico) }
          });
          console.log(`✅ Químico ${idQuimico} agregado`);
        }
      }

      setLoadingMessage('Finalizando registro...');
      setEntregaCreada(entregaCreada);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Respuesta del error:', error.response);
      
      // Si ya se creó la entrega pero falló algo después, informar al usuario
      if (entregaCreada) {
        setErrorMessage(
          `La entrega #ENT${String(entregaCreada.idEntrega).padStart(3, '0')} fue creada, pero ocurrió un error al agregar algunos materiales: ${error.response?.data || error.message}`
        );
      } else {
        setErrorMessage(error.response?.data || error.message || 'No se pudo crear la entrega');
      }
      
      setShowError(true);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const contarSeleccionados = (idTipoInsumo, esQuimico) => {
    if (esQuimico) {
      return (quimicosSeleccionados[idTipoInsumo] || []).length;
    } else {
      return (insumosSeleccionados[idTipoInsumo] || []).length;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Nueva Entrega</h2>
            <p className="text-gray-500 dark:text-gray-400">Seleccione los materiales del pedido que se entregarán al estudiante.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información General */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="idPedido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pedido Aprobado *
                  </label>
                  <select
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
                        #PED{String(pedido.idPedido).padStart(3, '0')} - {pedido.curso?.nombreCurso} ({pedido.estPedido?.nombreEstPedido})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Solo pedidos aprobados sin entregas registradas
                  </p>
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
              </div>
            </div>

            {/* Alerta si el pedido ya tiene entregas */}
            {entregasExistentes.length > 0 && (
              <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                      Este pedido ya tiene {entregasExistentes.length} entrega(s) registrada(s)
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Se creará una entrega adicional para este pedido.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información del Pedido */}
            {pedidoSeleccionado && (
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Información del Pedido #PED{String(pedidoSeleccionado.idPedido).padStart(3, '0')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Curso</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          {pedidoSeleccionado.curso?.nombreCurso}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Grupos</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          {pedidoSeleccionado.cantGrupos}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Instructor</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          {pedidoSeleccionado.instructor?.usuario?.nombre}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-400">Estado</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          {pedidoSeleccionado.estPedido?.nombreEstPedido}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Materiales Solicitados */}
            {loadingPedido ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando materiales del pedido...</p>
              </div>
            ) : detallesPedido.length > 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Materiales a Entregar
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    (Seleccione los materiales que entregará)
                  </span>
                </h3>
                
                <div className="space-y-6">
                  {detallesPedido.map((detalle, index) => {
                    const idTipoInsumo = detalle.tipoInsumo?.idTipoInsumo;
                    const esQuimico = detalle.tipoInsumo?.esQuimico;
                    const cantSolicitada = detalle.cantInsumo;
                    const cantSeleccionada = contarSeleccionados(idTipoInsumo, esQuimico);
                    
                    const items = esQuimico 
                      ? (quimicosDisponibles[idTipoInsumo] || [])
                      : (insumosDisponibles[idTipoInsumo] || []);
                    
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                        {/* Header del material */}
                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {detalle.tipoInsumo?.nombreTipoInsumo}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {detalle.tipoInsumo?.descripcion}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              esQuimico 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {esQuimico ? 'Químico' : 'Insumo físico'}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Solicitado: <span className="font-semibold">{cantSolicitada} {detalle.tipoInsumo?.unidad?.unidad}</span>
                            </p>
                            <p className={`text-sm mt-1 font-semibold ${
                              cantSeleccionada >= cantSolicitada 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-orange-600 dark:text-orange-400'
                            }`}>
                              Seleccionado: {cantSeleccionada} / {cantSolicitada}
                            </p>
                          </div>
                        </div>

                        {/* Lista de items disponibles */}
                        {items.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {items.map((item) => {
                              const itemId = esQuimico ? item.idQuimico : item.idInsumo;
                              const isSelected = esQuimico
                                ? (quimicosSeleccionados[idTipoInsumo] || []).includes(itemId)
                                : (insumosSeleccionados[idTipoInsumo] || []).includes(itemId);
                              
                              return (
                                <button
                                  key={itemId}
                                  type="button"
                                  onClick={() => esQuimico 
                                    ? toggleQuimicoSeleccionado(idTipoInsumo, itemId)
                                    : toggleInsumoSeleccionado(idTipoInsumo, itemId)
                                  }
                                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                                    isSelected
                                      ? 'border-[rgb(44,171,91)] bg-green-50 dark:bg-green-900/20'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                                        {esQuimico ? `#${item.idQuimico}` : `#${item.idInsumo}`}
                                      </p>
                                      {esQuimico && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {item.cantQuimico} {detalle.tipoInsumo?.unidad?.unidad}
                                        </p>
                                      )}
                                      {!esQuimico && item.estInsumo && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {item.estInsumo.nombreEstInsumo}
                                        </p>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <span className="material-symbols-outlined text-[rgb(44,171,91)] text-xl">
                                        check_circle
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                            No hay {esQuimico ? 'químicos' : 'insumos'} disponibles de este tipo
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : formEntrega.idPedido ? (
              <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg">
                <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">inventory_2</span>
                <p className="text-gray-600 dark:text-gray-400">
                  Este pedido no tiene materiales solicitados
                </p>
              </div>
            ) : null}

            {/* Botones de acción */}{/* Botones de acción */}
            {detallesPedido.length > 0 && (
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/entregas')}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check</span>
                      Registrar Entrega
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Modal de Carga con mensaje progresivo */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[rgb(44,171,91)]"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Registrando Entrega
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {loadingMessage || 'Por favor espere...'}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-[rgb(44,171,91)] h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
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
                  check_circle
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Entrega Registrada con Éxito!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                La entrega #ENT{String(entregaCreada?.idEntrega || 0).padStart(3, '0')} ha sido registrada correctamente con todos los materiales seleccionados.
              </p>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
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

export default NuevaEntrega;
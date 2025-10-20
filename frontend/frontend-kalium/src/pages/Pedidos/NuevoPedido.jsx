import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoService, insumoService, horarioService, pedidoDetalleService, experimentoService } from '../../services/api';
import axios from 'axios';

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instructores, setInstructores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [tiposPedido, setTiposPedido] = useState([]);
  const [tiposInsumo, setTiposInsumo] = useState([]);
  const [experimentos, setExperimentos] = useState([]);
  const [experimentoSeleccionado, setExperimentoSeleccionado] = useState('');
  // Estados para modales
  const [modalCursoOpen, setModalCursoOpen] = useState(false);
  const [modalTipoPedidoOpen, setModalTipoPedidoOpen] = useState(false);

  // Estados para formularios de creación rápida
  const [nuevoCurso, setNuevoCurso] = useState({ nombreCurso: '', codigoCurso: '' });
  const [nuevoTipoPedido, setNuevoTipoPedido] = useState({ nombrePedido: '' });

  // Modales
  const [showErrorStock, setShowErrorStock] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Obtener usuario del localStorage
  const usuarioStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
  const instructorId = usuarioStorage.id || '';
  const nombreInstructor = usuarioStorage.nombre ? 
    `${usuarioStorage.nombre} ${usuarioStorage.apellido || ''}`.trim() : '';

  const [formPedido, setFormPedido] = useState({
    fechaPedido: new Date().toISOString().split('T')[0],
    cantGrupos: 1,
    idInstructor: instructorId,
    nombreInstructor: nombreInstructor,
    idCurso: '',
    idTipoPedido: '',
    idHorario: '',
    horaEntrega: ''
  });

  // Estado para los horarios disponibles
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [horariosSemana, setHorariosSemana] = useState({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: []
  });

  const [items, setItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({
    idTipoInsumo: '',
    cantPorGrupo: 1, // Cantidad por grupo
    esQuimico: false
  });
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const obtenerFechaLocal = (valor) => {
    if (!valor) return null;
    if (valor instanceof Date) return valor;
    if (typeof valor === 'string') {
      const soloFecha = valor.split('T')[0];
      const [anio, mes, dia] = soloFecha.split('-').map(Number);
      if ([anio, mes, dia].some((parte) => Number.isNaN(parte))) {
        return null;
      }
      return new Date(anio, mes - 1, dia);
    }
    return null;
  };

  const obtenerDateHora = (hora, fechaFallback) => {
    if (!hora) return null;
    if (hora instanceof Date) return hora;
    if (typeof hora === 'string') {
      const conT = hora.replace(' ', 'T');
      const normalizada = conT.includes('T') ? conT : (fechaFallback ? `${fechaFallback}T${conT}` : conT);
      const fecha = new Date(normalizada);
      if (!isNaN(fecha.getTime())) {
        return fecha;
      }
    }
    if (fechaFallback) {
      const fechaBase = obtenerFechaLocal(fechaFallback);
      if (fechaBase) {
        return fechaBase;
      }
    }
    return null;
  };

  const obtenerDiaSemanaClave = (horario) => {
    if (!horario) return null;
    const diasMap = {
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sabado'
    };

    if (horario.diaSemana && diasMap[horario.diaSemana]) {
      return diasMap[horario.diaSemana];
    }

    const fecha = obtenerFechaLocal(horario.fechaEntrega);
    if (!fecha) return null;

    const mapFromDate = {
      0: 'domingo',
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sabado'
    };

    const dia = mapFromDate[fecha.getDay()];
    if (!dia || dia === 'domingo') {
      return null;
    }

    return dia;
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [instructoresRes, cursosRes, tiposPedidoRes, tiposInsumoRes, experimentosRes, horariosRes, pedidosRes] = await Promise.all([
        axios.get('http://localhost:8080/api/instructores'),
        axios.get('http://localhost:8080/api/cursos'),
        axios.get('http://localhost:8080/api/tipos-pedido'),
        insumoService.getTiposInsumoConStock(),
        experimentoService.getExperimentos(),
        horarioService.getHorarios(),
        pedidoService.getPedidos()
      ]);
      
      setInstructores(instructoresRes.data || []);
      setCursos(cursosRes.data || []);
      setTiposPedido(tiposPedidoRes.data || []);
      setTiposInsumo(tiposInsumoRes.data || []);
      setExperimentos(experimentosRes.data || []);

      const pedidos = Array.isArray(pedidosRes.data) ? pedidosRes.data : [];
      const pedidosPorHorario = new Map();

      pedidos.forEach(pedido => {
        const id = pedido?.horario?.idHorario;
        if (!id) return;
        const estado = pedido?.estPedido?.nombreEstPedido;
        if (estado && estado.toLowerCase() === 'cancelado') {
          // Si está cancelado, se considera liberado. No lo marcamos como ocupado.
          return;
        }
        pedidosPorHorario.set(id, {
          idPedido: pedido.idPedido,
          estado: estado || 'Desconocido'
        });
      });

      const agrupadosPorDia = {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: []
      };

      (horariosRes.data || []).forEach(horario => {
        const diaKey = obtenerDiaSemanaClave(horario);
        if (diaKey && agrupadosPorDia[diaKey]) {
          const inicio = horario?.horaInicioDate || obtenerDateHora(horario?.horaInicio, horario?.fechaEntrega);
          const fin = horario?.horaFinDate || obtenerDateHora(horario?.horaFin, horario?.fechaEntrega) || (inicio && (horario?.duracionMinutos || horario?.duracion)
            ? new Date(inicio.getTime() + (horario.duracionMinutos || horario.duracion) * 60000)
            : null);

          const ocupadoInfo = pedidosPorHorario.get(horario.idHorario);
          agrupadosPorDia[diaKey].push({
            ...horario,
            disponible: !ocupadoInfo,
            pedidoRelacionado: ocupadoInfo || null,
            horaInicioDate: inicio,
            horaFinDate: fin
          });
        }
      });

      setHorariosSemana(agrupadosPorDia);
      setHorariosDisponibles(horariosRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChangePedido = (e) => {
    const { name, value } = e.target;
    setFormPedido(prev => ({ ...prev, [name]: value }));
    
    // Si cambió la cantidad de grupos, recalcular cantidades totales
    if (name === 'cantGrupos' && items.length > 0) {
      const nuevosCantGrupos = parseInt(value) || 1;
      setItems(prev => prev.map(item => ({
        ...item,
        cantidadTotal: item.cantPorGrupo * nuevosCantGrupos
      })));
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

  const cargarInsumosDeExperimento = async (idExperimento) => {
    if (!idExperimento) {
      setExperimentoSeleccionado('');
      return;
    }

    try {
      setExperimentoSeleccionado(idExperimento);
      
      // Obtener detalles del experimento
      const detallesRes = await experimentoService.getDetallesExperimento(idExperimento);
      const detalles = detallesRes.data || [];
      
      // Limpiar items actuales
      setItems([]);
      
      // Agregar cada insumo del experimento
      const cantGrupos = parseInt(formPedido.cantGrupos) || 1;
      
      for (const detalle of detalles) {
        const tipoInsumo = tiposInsumo.find(t => t.idTipoInsumo === detalle.tipoInsumo.idTipoInsumo);
        
        if (tipoInsumo) {
          const cantPorGrupo = detalle.cantInsumoExperimento;
          const cantidadTotal = cantPorGrupo * cantGrupos;
          
          setItems(prev => [...prev, {
            idTipoInsumo: detalle.tipoInsumo.idTipoInsumo,
            cantPorGrupo: cantPorGrupo,
            cantidadTotal: cantidadTotal,
            nombreTipoInsumo: tipoInsumo.nombreTipoInsumo,
            unidad: tipoInsumo.unidad?.unidad,
            esQuimico: tipoInsumo.esQuimico
          }]);
        }
      }
      
      // Auto-seleccionar Tipo de Pedido: "Experimento de Investigación" (ID=2)
      setFormPedido(prev => ({ ...prev, idTipoPedido: '2' }));
      
    } catch (error) {
      console.error('Error al cargar insumos del experimento:', error);
      setErrorMessage('Error al cargar los insumos del experimento');
      setShowErrorStock(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (items.length === 0) {
        throw new Error('Debe agregar al menos un ítem al pedido');
      }

      if (!horarioSeleccionado) {
        throw new Error('Seleccione un horario disponible');
      }

      // ✅ Crear el pedido usando el horario seleccionado existente
      const pedidoData = {
        fechaPedido: formPedido.fechaPedido,
        cantGrupos: parseInt(formPedido.cantGrupos),
        instructor: { idInstructor: parseInt(formPedido.idInstructor) },
        estPedido: { idEstPedido: 1 }, // Pendiente
        curso: { idCurso: parseInt(formPedido.idCurso) },
        tipoPedido: { idTipoPedido: parseInt(formPedido.idTipoPedido) },
        horario: { idHorario: horarioSeleccionado.idHorario }
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

  // Función para crear curso rápido
  const handleCrearCursoRapido = async () => {
    try {
      if (!nuevoCurso.nombreCurso.trim()) {
        alert('El nombre del curso es obligatorio');
        return;
      }

      const response = await axios.post('http://localhost:8080/api/cursos', {
        nombreCurso: nuevoCurso.nombreCurso,
        codigo: nuevoCurso.codigoCurso || null,
        descripcion: null
      });

      // Recargar cursos
      const cursosRes = await axios.get('http://localhost:8080/api/cursos');
      setCursos(cursosRes.data);

      // Seleccionar el nuevo curso automáticamente
      setFormPedido(prev => ({
        ...prev,
        idCurso: response.data.idCurso
      }));

      // Cerrar modal y limpiar
      setModalCursoOpen(false);
      setNuevoCurso({ nombreCurso: '', codigoCurso: '' });

      alert('Curso creado exitosamente');
    } catch (error) {
      console.error('Error al crear curso:', error);
      alert(error.response?.data || 'Error al crear curso');
    }
  };

  // Función para crear tipo de pedido rápido
  const handleCrearTipoPedidoRapido = async () => {
    try {
      if (!nuevoTipoPedido.nombrePedido.trim()) {
        alert('El nombre del tipo de pedido es obligatorio');
        return;
      }

      const response = await axios.post('http://localhost:8080/api/tipos-pedido', {
        nombrePedido: nuevoTipoPedido.nombrePedido
      });

      // Recargar tipos de pedido
      const tiposRes = await axios.get('http://localhost:8080/api/tipos-pedido');
      setTiposPedido(tiposRes.data);

      // Seleccionar el nuevo tipo automáticamente
      setFormPedido(prev => ({
        ...prev,
        idTipoPedido: response.data.idTipoPedido
      }));

      // Cerrar modal y limpiar
      setModalTipoPedidoOpen(false);
      setNuevoTipoPedido({ nombrePedido: '' });

      alert('Tipo de pedido creado exitosamente');
    } catch (error) {
      console.error('Error al crear tipo de pedido:', error);
      alert(error.response?.data || 'Error al crear tipo de pedido');
    }
  };

  const seleccionarHorario = (horario) => {
    if (!horario?.disponible) {
      setErrorMessage('Este horario ya tiene un pedido asignado');
      setShowErrorStock(true);
      return;
    }

    const inicio = horario?.horaInicioDate || obtenerDateHora(horario?.horaInicio, horario?.fechaEntrega);
    const finCalculado = horario?.horaFinDate || obtenerDateHora(horario?.horaFin, horario?.fechaEntrega) || (inicio && (horario?.duracionMinutos || horario?.duracion)
      ? new Date(inicio.getTime() + (horario.duracionMinutos || horario.duracion) * 60000)
      : null);

    setHorarioSeleccionado({
      ...horario,
      horaInicioDate: inicio,
      horaFinDate: finCalculado
    });
    setFormPedido(prev => ({
      ...prev,
      idHorario: horario.idHorario,
      horaEntrega: inicio ? inicio.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }) : ''
    }));

    // Limpiamos cualquier mensaje previo de error
    setErrorMessage('');
    setShowErrorStock(false);
  };

  // Función para formatear la hora
  const formatearHora = (hora) => {
    const [h, m] = hora.split(':');
    const horaNum = parseInt(h);
    const periodo = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum % 12 || 12;
    return `${hora12}:${m} ${periodo}`;
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Nuevo Pedido</h2>
        <p className="text-gray-500 dark:text-gray-400">Complete el formulario para registrar un nuevo pedido.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información del Pedido */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Información del Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha del Pedido */}
            <div>
              <label htmlFor="fechaPedido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha del Pedido
              </label>
              <input
                type="text"
                id="fechaPedido"
                value={new Date(formPedido.fechaPedido).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                readOnly
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
              />
              <input
                type="hidden"
                name="fechaPedido"
                value={formPedido.fechaPedido}
              />
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="idInstructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructor
              </label>
              <input
                type="text"
                value={nombreInstructor}
                className="w-full p-2 border rounded-md bg-gray-100"
                readOnly
              />
              <input
                type="hidden"
                name="idInstructor"
                value={formPedido.idInstructor}
              />
            </div>

            {/* Curso */}
            <div>
              <label htmlFor="idCurso" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Curso
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="idCurso"
                  name="idCurso"
                  value={formPedido.idCurso}
                  onChange={handleChangePedido}
                  required
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.idCurso} value={curso.idCurso}>
                      {curso.nombreCurso}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setModalCursoOpen(true)}
                  className="px-3 py-2 bg-[#2cab5bff] text-white rounded-lg hover:bg-[#2ab885] transition-colors"
                  title="Agregar curso nuevo"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </div>
            </div>

            {/* Tipo de Pedido */}
            <div>
              <label htmlFor="idTipoPedido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Pedido
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="idTipoPedido"
                  name="idTipoPedido"
                  value={formPedido.idTipoPedido}
                  onChange={handleChangePedido}
                  required
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposPedido.map(tipo => (
                    <option key={tipo.idTipoPedido} value={tipo.idTipoPedido}>
                      {tipo.nombrePedido}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setModalTipoPedidoOpen(true)}
                  className="px-3 py-2 bg-[#2cab5bff] text-white rounded-lg hover:bg-[#2ab885] transition-colors"
                  title="Agregar tipo de pedido nuevo"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horario seleccionado
              </label>
              {horarioSeleccionado ? (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                  <div className="font-medium">
                    {(horarioSeleccionado.horaInicioDate || obtenerDateHora(horarioSeleccionado.horaInicio, horarioSeleccionado.fechaEntrega))?.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div>
                    {(horarioSeleccionado.horaInicioDate || obtenerDateHora(horarioSeleccionado.horaInicio, horarioSeleccionado.fechaEntrega))?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {(horarioSeleccionado.horaFinDate || obtenerDateHora(horarioSeleccionado.horaFin, horarioSeleccionado.fechaEntrega))?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {horarioSeleccionado.laboratorio?.nombre || 'Sin laboratorio asignado'}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                  Seleccione un horario en la sección de horarios semanales.
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Horarios semanales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(horariosSemana).map(([dia, horarios]) => (
              <div key={dia} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="text-base font-medium capitalize text-gray-800 dark:text-gray-200 mb-3">{dia}</h4>
                <div className="space-y-2 text-sm">
                  {horarios.length === 0 && (
                    <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-600 p-3 text-gray-500 dark:text-gray-400">
                      No hay horarios registrados
                    </div>
                  )}
                  {horarios.map((horario, index) => {
                    const disponible = horario?.disponible ?? true;
                    const inicio = horario?.horaInicioDate || obtenerDateHora(horario?.horaInicio, horario?.fechaEntrega);
                    const fin = horario?.horaFinDate || obtenerDateHora(horario?.horaFin, horario?.fechaEntrega) || (inicio && (horario?.duracionMinutos || horario?.duracion)
                      ? new Date(inicio.getTime() + (horario.duracionMinutos || horario.duracion) * 60000)
                      : null);

                    return (
                      <button
                        key={`${horario?.idHorario}-${index}`}
                        type="button"
                        onClick={() => seleccionarHorario(horario)}
                        className={`w-full rounded-md px-3 py-3 text-left transition-colors border ${
                          horarioSeleccionado?.idHorario === horario.idHorario
                            ? 'border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
                            : disponible
                              ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200'
                              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200'
                        } ${disponible ? '' : 'cursor-not-allowed opacity-80'}`}
                        disabled={!disponible}
                      >
                        <div className="font-medium">
                          {inicio ? inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          {' - '}
                          {fin ? fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {horario?.laboratorio?.nombre || 'Sin laboratorio'}
                        </div>
                        {!disponible && (
                          <div className="text-xs font-medium">
                            No disponible (Pedido #{horario?.pedidoRelacionado?.idPedido || '—'})
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Agregar insumo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complete los campos para añadir los insumos al pedido.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="idTipoInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de insumo
              </label>
              <select
                id="idTipoInsumo"
                name="idTipoInsumo"
                value={nuevoItem.idTipoInsumo}
                onChange={handleChangeItem}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar tipo de insumo...</option>
                {tiposInsumo.map(tipo => (
                  <option key={tipo.idTipoInsumo} value={tipo.idTipoInsumo}>
                    {tipo.nombreTipoInsumo} {tipo.cantidadTotal ? `(Disponible: ${tipo.cantidadTotal} ${tipo.unidad?.unidad || ''})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cantPorGrupo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad por grupo
              </label>
              <input
                id="cantPorGrupo"
                name="cantPorGrupo"
                type="number"
                min="1"
                value={nuevoItem.cantPorGrupo}
                onChange={(e) => handleChangeItem({ target: { name: 'cantPorGrupo', value: parseFloat(e.target.value) || 1 } })}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={agregarItem}
                className="w-full rounded-md bg-[#2cab5bff] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ab885] transition-colors"
              >
                Agregar a la lista
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Lista de insumos del pedido</h4>
            {items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
                Aún no has agregado insumos. Utiliza el formulario superior para añadirlos al pedido.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">Tipo de insumo</th>
                      <th className="px-4 py-3 text-left">Cantidad / grupo</th>
                      <th className="px-4 py-3 text-left">Total ({formPedido.cantGrupos} grupos)</th>
                      <th className="px-4 py-3 text-left">Unidad</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {items.map((item, index) => (
                      <tr key={`${item.idTipoInsumo}-${index}`}>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.nombreTipoInsumo}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.cantPorGrupo}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.cantidadTotal}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.unidad || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className={`rounded-md px-6 py-2 text-sm font-medium text-white transition-colors ${
              items.length === 0 || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#2cab5bff] hover:bg-[#2ab885]'
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar pedido'}
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white px-8 py-6 text-center shadow-lg dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <span className="material-symbols-outlined">check</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Pedido creado exitosamente</h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Serás redirigido en unos segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoPedido;
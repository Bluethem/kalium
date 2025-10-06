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
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [instructorActual, setInstructorActual] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [formPedido, setFormPedido] = useState({
    fechaPedido: new Date().toISOString().split('T')[0],
    cantGrupos: 1,
    idCurso: '',
    idTipoPedido: ''
  });
  const [items, setItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({
    idTipoInsumo: '',
    cantInsumo: 1,
    esQuimico: false
  });

  useEffect(() => {
    cargarDatos();
    
    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Actualizando horarios automáticamente...');
      cargarHorarios();
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar datos básicos primero
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
      
      // Debug: Ver estructura de datos
      console.log('📊 Tipos de insumo cargados:', tiposInsumoRes.data);
      console.log('📚 Cursos cargados:', cursosRes.data);

      // Buscar instructor del usuario en sesión
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        const parsed = JSON.parse(usuario);
        // Buscar en la lista de instructores el que coincida con el usuario actual
        const instructorEncontrado = (instructoresRes.data || []).find(
          inst => inst.usuario?.idUsuario === parsed.idUsuario
        );
        if (instructorEncontrado) {
          setInstructorActual(instructorEncontrado);
        } else {
          console.log('No se encontró instructor para este usuario');
        }
      }

      // Cargar horarios por separado
      await cargarHorarios();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const cargarHorarios = async () => {
    try {
      console.log('🔄 Consultando BD para horarios actualizados...');
      
      // PASO 1: Crear endpoint temporal usando una consulta SQL directa
      // Mientras no existe /api/horarios, vamos a usar una consulta personalizada
      
      try {
        // Intentar endpoint de horarios (cuando esté implementado)
        const horariosRes = await axios.get('http://localhost:8080/api/horarios');
        const todosLosHorarios = horariosRes.data || [];
        console.log('📅 Horarios desde BD:', todosLosHorarios);
        
        // Obtener pedidos para determinar cuáles están ocupados
        const pedidosRes = await axios.get('http://localhost:8080/api/pedidos');
        const pedidos = pedidosRes.data || [];
        console.log('📦 Pedidos desde BD:', pedidos);
        
        // Separar horarios disponibles y ocupados
        const horariosLibres = todosLosHorarios.filter(horario => {
          const tieneAsignacion = pedidos.some(pedido => pedido.horario?.idHorario === horario.idHorario);
          return !tieneAsignacion;
        });
        
        const horariosOcupados = todosLosHorarios.filter(horario => {
          const tieneAsignacion = pedidos.some(pedido => pedido.horario?.idHorario === horario.idHorario);
          return tieneAsignacion;
        });
        
        console.log('🟢 Horarios libres desde BD:', horariosLibres);
        console.log('🔴 Horarios ocupados desde BD:', horariosOcupados);
        
        // Actualizar estado
        setHorariosDisponibles(horariosLibres);
        window.horariosOcupados = horariosOcupados;
        
      } catch (endpointError) {
        console.warn('⚠️ Endpoint /api/horarios no disponible:', endpointError.message);
        
        // FALLBACK: Usar consulta SQL directa temporal
        console.log('🔄 Usando consulta SQL directa...');
        
        // Simular consulta directa a BD (reemplazar con datos reales)
        const sqlQuery = `
          SELECT h.*, 
                 CASE WHEN p.idHorario IS NOT NULL THEN 1 ELSE 0 END as ocupado
          FROM horario h 
          LEFT JOIN pedido p ON h.idHorario = p.idHorario
          ORDER BY h.fechaEntrega, h.horaInicio
        `;
        
        console.log('📊 Consulta SQL que necesitas ejecutar:', sqlQuery);
        
        // Por ahora, usar datos hardcodeados que reflejen la BD actual
        // IMPORTANTE: Estos datos deben coincidir con tu BD
        const todosLosHorarios = [
          {
            idHorario: 1,
            fechaEntrega: "2025-10-06",
            horaInicio: "2025-10-06T08:00:00",
            ocupado: false // Cambiar según BD real
          },
          {
            idHorario: 2,
            fechaEntrega: "2025-10-08", 
            horaInicio: "2025-10-08T10:00:00",
            ocupado: false
          },
          {
            idHorario: 3,
            fechaEntrega: "2025-10-10",
            horaInicio: "2025-10-10T14:00:00",
            ocupado: false
          },
          {
            idHorario: 4,
            fechaEntrega: "2025-10-07",
            horaInicio: "2025-10-07T14:00:00",
            ocupado: false
          },
          {
            idHorario: 5,
            fechaEntrega: "2025-10-07",
            horaInicio: "2025-10-07T12:00:00",
            ocupado: false
          }
        ];
        
        const horariosLibres = todosLosHorarios.filter(h => !h.ocupado);
        const horariosOcupados = todosLosHorarios.filter(h => h.ocupado);
        
        console.log('🟢 Horarios libres (fallback):', horariosLibres);
        console.log('🔴 Horarios ocupados (fallback):', horariosOcupados);
        
        setHorariosDisponibles(horariosLibres);
        window.horariosOcupados = horariosOcupados;
      }
      
    } catch (error) {
      console.error('❌ Error al cargar horarios:', error);
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
    
    // VALIDACIÓN POR GRUPOS: cantidad por grupo * cantidad de grupos
    const cantidadDisponible = parseFloat(tipoInsumo.cantidadNumerica || 0);
    const cantidadPorGrupo = parseFloat(nuevoItem.cantInsumo);
    const cantidadTotalNecesaria = cantidadPorGrupo * formPedido.cantGrupos;
    
    if (cantidadTotalNecesaria > cantidadDisponible) {
      setErrorMessage(
        `Stock insuficiente para ${formPedido.cantGrupos} grupo(s).\n` +
        `Necesitas: ${cantidadTotalNecesaria} ${tipoInsumo.unidad?.unidad}\n` +
        `Disponible: ${tipoInsumo.cantidadTotal} ${tipoInsumo.unidad?.unidad}`
      );
      setShowErrorStock(true);
      return;
    }
    
    setItems(prev => [...prev, {
      ...nuevoItem,
      nombreTipoInsumo: tipoInsumo.nomTipoInsumo || tipoInsumo.nombre || tipoInsumo.nombreTipoInsumo,
      unidad: tipoInsumo.unidad?.unidad || tipoInsumo.unidad?.nomUnidad || tipoInsumo.unidad?.nombre
    }]);

    setNuevoItem({ idTipoInsumo: '', cantInsumo: 1, esQuimico: false });
  };

  const eliminarItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Función para organizar horarios por día y hora
  const organizarHorarios = () => {
    console.log('🎯 === INICIANDO ORGANIZACIÓN DE HORARIOS ===');
    
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const horariosDelDia = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];
    
    const tablero = {};
    
    // Inicializar tablero con estado "no_habilitado"
    diasSemana.forEach(dia => {
      tablero[dia] = {};
      horariosDelDia.forEach(horario => {
        tablero[dia][horario] = { estado: 'no_habilitado' }; // Por defecto no habilitado
      });
    });
    
    console.log('📋 Tablero inicializado:', tablero);
    console.log('📅 Horarios disponibles recibidos:', horariosDisponibles);
    console.log('📊 Cantidad de horarios disponibles:', horariosDisponibles.length);
    
    // Obtener horarios ocupados
    const horariosOcupados = window.horariosOcupados || [];
    console.log('🔴 Horarios ocupados:', horariosOcupados);
    
    // Función auxiliar para procesar un horario
    const procesarHorario = (horario, estado) => {
      const horaInicio = new Date(horario.horaInicio);
      const diasSemanaNum = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const nombreDia = diasSemanaNum[horaInicio.getDay()];
      
      // Solo procesar días laborables (Lunes a Viernes)
      if (tablero[nombreDia]) {
        const horas = horaInicio.getHours();
        const minutos = horaInicio.getMinutes();
        
        const horaInicioStr = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        const horaFinStr = `${(horas + 2).toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        const rangoHora = `${horaInicioStr}-${horaFinStr}`;
        
        if (tablero[nombreDia][rangoHora] !== undefined) {
          tablero[nombreDia][rangoHora] = {
            ...horario,
            estado: estado
          };
          console.log(`✅ Horario ${estado}:`, nombreDia, rangoHora);
        }
      }
    };
    
    // Procesar horarios disponibles (VERDE)
    horariosDisponibles.forEach(horario => {
      procesarHorario(horario, 'disponible');
    });
    
    // Procesar horarios ocupados (ROJO)
    horariosOcupados.forEach(horario => {
      procesarHorario(horario, 'ocupado');
    });
    
    console.log('🏁 === TABLERO FINAL ===');
    console.log('Tablero completo:', tablero);
    
    // Contar horarios disponibles por día
    diasSemana.forEach(dia => {
      const disponibles = Object.values(tablero[dia]).filter(slot => slot !== null).length;
      console.log(`${dia}: ${disponibles} horarios disponibles`);
    });
    
    return tablero;
  };

  const seleccionarHorario = (horario) => {
    setHorarioSeleccionado(horario);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones antes de mostrar confirmación
    if (items.length === 0) {
      setErrorMessage('Debe agregar al menos un ítem al pedido');
      setShowErrorStock(true);
      return;
    }

    if (!instructorActual) {
      setErrorMessage('No se pudo identificar al instructor. Verifique que ha iniciado sesión correctamente.');
      setShowErrorStock(true);
      return;
    }

    if (!horarioSeleccionado) {
      setErrorMessage('Debe seleccionar un horario para el pedido.');
      setShowErrorStock(true);
      return;
    }

    if (!formPedido.idCurso || !formPedido.idTipoPedido) {
      setErrorMessage('Debe completar todos los campos del formulario.');
      setShowErrorStock(true);
      return;
    }

    // Si todas las validaciones pasan, mostrar confirmación
    setShowConfirmacion(true);
  };

  const confirmarPedido = async () => {
    setLoading(true);
    setShowConfirmacion(false);

    try {

      // Crear el pedido con el horario seleccionado
      const pedidoData = {
        fechaPedido: formPedido.fechaPedido,
        cantGrupos: parseInt(formPedido.cantGrupos),
        instructor: { idInstructor: instructorActual.idInstructor },
        estPedido: { idEstPedido: 1 }, // Pendiente
        curso: { idCurso: parseInt(formPedido.idCurso) },
        tipoPedido: { idTipoPedido: parseInt(formPedido.idTipoPedido) },
        horario: { idHorario: horarioSeleccionado.idHorario }
      };
      
      console.log('📦 Datos del pedido a enviar:', pedidoData);

      const pedidoRes = await pedidoService.createPedido(pedidoData);
      console.log('✅ Pedido creado exitosamente:', pedidoRes.data);
      
      // Crear detalles del pedido
      for (const item of items) {
        await axios.post('http://localhost:8080/api/pedidos-detalle', {
          cantInsumo: parseInt(item.cantInsumo),
          pedido: { idPedido: pedidoRes.data.idPedido },
          tipoInsumo: { idTipoInsumo: parseInt(item.idTipoInsumo) }
        });
      }

      // Actualizar horarios después de crear el pedido
      await cargarHorarios();
      
      setShowSuccess(true);
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      console.error('❌ Error completo:', error.response);
      
      let errorMsg = 'Error desconocido';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data) {
        errorMsg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage('Error al crear pedido: ' + errorMsg);
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
                    Fecha del Pedido (Hoy)
                  </label>
                  <input
                    type="date"
                    id="fechaPedido"
                    name="fechaPedido"
                    value={formPedido.fechaPedido}
                    readOnly
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    title="La fecha del pedido se establece automáticamente como hoy"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Se establece automáticamente como la fecha actual
                  </p>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instructor
                  </label>
                  <div className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
                    {instructorActual ? (
                      <span>{instructorActual.usuario?.nombre} {instructorActual.usuario?.apellido}</span>
                    ) : (
                      <span className="text-gray-400">Cargando...</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Asignado automáticamente según tu sesión
                  </p>
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

            {/* Selección de Horario */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Seleccionar Horario</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selecciona un horario disponible para tu práctica de laboratorio (2 horas de duración)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cargarHorarios}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Actualizar horarios disponibles"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Actualizar
                </button>
              </div>
              
              {/* Leyenda de colores */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-600 rounded border"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded border"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded border"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No Habilitado</span>
                </div>
              </div>
              
              {/* Tablero Semanal */}
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Encabezados de días */}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 p-2"></div>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => (
                      <div key={dia} className="text-sm font-medium text-gray-600 dark:text-gray-300 p-2 text-center">
                        {dia}
                      </div>
                    ))}
                  </div>
                  
                  {/* Filas de horarios */}
                  {['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'].map(horario => {
                    const tablero = organizarHorarios();
                    return (
                      <div key={horario} className="grid grid-cols-6 gap-2 mb-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 p-3 text-right">
                          {horario}
                        </div>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => {
                          const slot = tablero[dia]?.[horario];
                          const isSelected = horarioSeleccionado?.idHorario === slot?.idHorario;
                          
                          // Determinar el estado del slot
                          let estado, estilos, texto, clickeable;
                          
                          if (slot?.estado === 'disponible') {
                            // 🟢 DISPONIBLE - Horario libre para seleccionar
                            estado = 'disponible';
                            clickeable = true;
                            texto = 'Disponible';
                            
                            if (isSelected) {
                              estilos = 'bg-emerald-700 text-white border-emerald-700 shadow-xl transform scale-105 ring-4 ring-emerald-200';
                            } else {
                              estilos = 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:transform hover:scale-102 cursor-pointer';
                            }
                          } else if (slot?.estado === 'ocupado') {
                            // 🔴 OCUPADO - Horario con pedido asignado
                            estado = 'ocupado';
                            clickeable = false;
                            texto = 'Ocupado';
                            estilos = 'bg-red-600 text-white border-red-600 cursor-not-allowed opacity-90';
                          } else {
                            // ⚫ NO HABILITADO - Horario que no existe en la BD
                            estado = 'no_habilitado';
                            clickeable = false;
                            texto = 'No Habilitado';
                            estilos = 'bg-gray-600 text-gray-300 border-gray-600 cursor-not-allowed opacity-60';
                          }
                          
                          return (
                            <button
                              key={`${dia}-${horario}`}
                              type="button"
                              onClick={() => clickeable && seleccionarHorario(slot)}
                              disabled={!clickeable}
                              className={`
                                p-3 rounded-lg border text-sm font-bold transition-all duration-200
                                ${estilos}
                              `}
                              title={`${dia} ${horario} - ${texto}`}
                            >
                              {texto}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Horario seleccionado */}
              {horarioSeleccionado && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">
                    Horario seleccionado: {new Date(horarioSeleccionado.horaInicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} 
                    {' de '}{new Date(horarioSeleccionado.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    {' a '}{new Date(new Date(horarioSeleccionado.horaInicio).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>

            {/* Insumos y Químicos */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Insumos y Químicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-6">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unidad
                  </label>
                  <div className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
                    {nuevoItem.idTipoInsumo ? (
                      <span className="font-medium">
                        {tiposInsumo.find(t => t.idTipoInsumo === parseInt(nuevoItem.idTipoInsumo))?.unidad?.unidad || 'N/A'}
                      </span>
                    ) : (
                      <span className="text-gray-400">Selecciona un insumo</span>
                    )}
                  </div>
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
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Unidad
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
                            {item.cantInsumo}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.unidad}
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

      {/* Modal de Confirmación */}
      {showConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">
                  check_circle
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Confirmar Pedido
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor, revisa los detalles del pedido antes de confirmar.
              </p>
            </div>

            {/* Información del Pedido */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información del Pedido</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Solicitante</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {instructorActual ? `${instructorActual.usuario?.nombre} ${instructorActual.usuario?.apellido}` : 'Cargando...'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Estado</dt>
                  <dd><span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pendiente</span></dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Fecha de creación</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(formPedido.fechaPedido).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Horario de práctica</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {horarioSeleccionado ? 
                      `${new Date(horarioSeleccionado.horaInicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} de ${new Date(horarioSeleccionado.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} a ${new Date(new Date(horarioSeleccionado.horaInicio).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` 
                      : 'No seleccionado'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Cantidad de grupos</dt>
                  <dd className="text-gray-900 dark:text-white">{formPedido.cantGrupos}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Curso</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {(() => {
                      const curso = cursos.find(c => c.idCurso === parseInt(formPedido.idCurso));
                      console.log('🔍 Curso buscado ID:', formPedido.idCurso);
                      console.log('🔍 Curso encontrado:', curso);
                      console.log('🔍 Todos los cursos:', cursos);
                      return curso?.nomCurso || curso?.nombre || 'No seleccionado';
                    })()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Insumos Solicitados */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
                Insumos Solicitados
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Insumo</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item, index) => {
                      // Usar los datos ya guardados en el item
                      console.log('🔍 Item completo:', item);
                      
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                            {item.nombreTipoInsumo || 'Desconocido'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {item.cantInsumo}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {item.unidad || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowConfirmacion(false)}
                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPedido}
                disabled={loading}
                className="w-full sm:w-auto bg-[rgb(44,171,91)] text-white hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
              >
                {loading ? 'Confirmando...' : 'Confirmar Pedido'}
              </button>
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
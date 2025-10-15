import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { entregaService, pedidoService, estudianteService } from '../../services/api';

const GenerarEntregas = () => {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    cargarDatos();
  }, [idPedido]);
  
  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      
      // Cargar pedido
      const pedidoRes = await pedidoService.getPedidoById(idPedido);
      setPedido(pedidoRes.data);
      
      // Cargar estudiantes
      const estudiantesRes = await estudianteService.getEstudiantes();
      setEstudiantes(estudiantesRes.data || []);
      
      // Verificar si ya tiene entregas generadas
      const tieneEntregas = await entregaService.verificarEntregasPorPedido(idPedido);
      
      if (tieneEntregas.data) {
        // Si ya tiene entregas, cargarlas
        const entregasRes = await entregaService.getEntregasPorPedido(idPedido);
        setEntregas(entregasRes.data || []);
        
        // Crear mapa de asignaciones existentes
        const asignacionesMap = {};
        (entregasRes.data || []).forEach(entrega => {
          if (entrega.estudiante) {
            asignacionesMap[entrega.idEntrega] = entrega.estudiante.idEstudiante;
          }
        });
        setAsignaciones(asignacionesMap);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorMessage('Error al cargar los datos del pedido');
      setShowError(true);
    } finally {
      setLoadingData(false);
    }
  };
  
  const generarEntregas = async () => {
    try {
      setLoading(true);
      const response = await entregaService.generarEntregasPorGrupos(idPedido);
      setEntregas(response.data || []);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error al generar entregas:', error);
      setErrorMessage(error.response?.data || 'Error al generar entregas');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAsignarEstudiante = (idEntrega, idEstudiante) => {
    setAsignaciones(prev => ({
      ...prev,
      [idEntrega]: idEstudiante
    }));
  };
  
  const guardarAsignacion = async (idEntrega) => {
    const idEstudiante = asignaciones[idEntrega];
    
    if (!idEstudiante) {
      setErrorMessage('Selecciona un estudiante');
      setShowError(true);
      return;
    }
    
    try {
      await entregaService.asignarEstudiante(idEntrega, idEstudiante);
      
      // Recargar entregas
      const entregasRes = await entregaService.getEntregasPorPedido(idPedido);
      setEntregas(entregasRes.data || []);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error al asignar estudiante:', error);
      setErrorMessage('Error al asignar estudiante');
      setShowError(true);
    }
  };
  
  const finalizarYVolver = () => {
    navigate(`/pedidos/${idPedido}`);
  };
  
  if (loadingData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!pedido) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">Pedido no encontrado</div>
        </div>
      </div>
    );
  }
  
  const todasAsignadas = entregas.length > 0 && entregas.every(e => e.estudiante !== null);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      
      {/* Notificaciones */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Operación exitosa
            </p>
          </div>
        </div>
      )}
      
      {showError && (
        <div className="fixed top-20 right-4 z-50 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
            </div>
            <button onClick={() => setShowError(false)} className="ml-4">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">close</span>
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/pedidos/${idPedido}`)}
                className="mb-2 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-[rgb(44,171,91)]"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Volver al pedido
              </button>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Generar Entregas
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Pedido #{String(pedido.idPedido).padStart(3, '0')} - {pedido.curso?.nombreCurso}
              </p>
            </div>
          </div>
          
          {/* Info del pedido */}
          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información del Pedido
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad de Grupos</p>
                <p className="text-2xl font-bold text-[rgb(44,171,91)] dark:text-white">
                  {pedido.cantGrupos}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {pedido.instructor?.usuario?.nombre} {pedido.instructor?.usuario?.apellido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Entrega</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(pedido.horario?.fechaEntrega).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pedido.estPedido?.idEstPedido === 2 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                  pedido.estPedido?.idEstPedido === 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                  {pedido.estPedido?.nombreEstPedido}
                </span>
              </div>
            </div>
          </div>
          
          {/* Generación de entregas */}
          {entregas.length === 0 ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-[rgb(44,171,91)]/10 dark:bg-[rgb(44,171,91)]/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-[rgb(44,171,91)] dark:text-white">
                  inventory_2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generar {pedido.cantGrupos} Entregas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Se crearán {pedido.cantGrupos} entregas individuales para asignar a cada grupo/estudiante
              </p>
              <button
                onClick={generarEntregas}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add_circle</span>
                    Generar Entregas
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Asignar Estudiantes a Entregas
                </h3>
                {todasAsignadas && (
                  <button
                    onClick={finalizarYVolver}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Finalizar
                  </button>
                )}
              </div>
              
              {entregas.map((entrega, index) => (
                <div
                  key={entrega.idEntrega}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[rgb(44,171,91)]/10 dark:bg-[rgb(44,171,91)]/20">
                        <span className="font-bold text-[rgb(44,171,91)] dark:text-white">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Entrega #{String(entrega.idEntrega).padStart(3, '0')}
                        </p>
                        
                        {entrega.estudiante ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Asignada a: <span className="font-medium text-[rgb(44,171,91)] dark:text-white">
                              {entrega.estudiante.nombre} {entrega.estudiante.apellido}
                            </span>
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
                            <select
                              value={asignaciones[entrega.idEntrega] || ''}
                              onChange={(e) => handleAsignarEstudiante(entrega.idEntrega, parseInt(e.target.value))}
                              className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[rgb(44,171,91)] focus:border-[rgb(44,171,91)]"
                            >
                              <option value="">Seleccionar estudiante</option>
                              {estudiantes.map(est => (
                                <option key={est.idEstudiante} value={est.idEstudiante}>
                                  {est.nombre} {est.apellido}
                                </option>
                              ))}
                            </select>
                            
                            <button
                              onClick={() => guardarAsignacion(entrega.idEntrega)}
                              disabled={!asignaciones[entrega.idEntrega]}
                              className="flex items-center gap-1 rounded-lg bg-[rgb(44,171,91)] px-3 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">save</span>
                              Guardar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {entrega.estudiante && (
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                        check_circle
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GenerarEntregas;

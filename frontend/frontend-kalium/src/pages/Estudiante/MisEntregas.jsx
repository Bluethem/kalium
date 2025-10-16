import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { entregaService, devolucionService } from '../../services/api';

const MisEntregas = () => {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar entregas del estudiante
      const entregasRes = await entregaService.getEntregasPorEstudiante(usuario.idUsuario);
      setEntregas(entregasRes.data || []);
      
      // Cargar devoluciones para saber cuáles entregas ya fueron devueltas
      const devolucionesRes = await devolucionService.getDevolucionesPorEstudiante(usuario.idUsuario);
      setDevoluciones(devolucionesRes.data || []);
    } catch (error) {
      console.error('Error al cargar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const tieneDevolucion = (idEntrega) => {
    return devoluciones.some(dev => dev.entrega?.idEntrega === idEntrega);
  };

  const getEstadoDevolucion = (idEntrega) => {
    const dev = devoluciones.find(d => d.entrega?.idEntrega === idEntrega);
    return dev?.estDevolucion;
  };

  const iniciarDevolucion = (idEntrega) => {
    navigate(`/devoluciones/nueva?crear=true&entrega=${idEntrega}`);
  };

  const formatearFechaHora = (fecha, hora) => {
    if (!hora) return 'N/A';
    const fechaHora = new Date(hora);
    return fechaHora.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (idEntrega) => {
    if (!tieneDevolucion(idEntrega)) {
      return {
        texto: 'Activa',
        clase: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      };
    }
    
    const estado = getEstadoDevolucion(idEntrega);
    
    if (estado?.idEstDevolucion === 1) {
      return {
        texto: 'Devolución Pendiente',
        clase: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      };
    } else if (estado?.idEstDevolucion === 2) {
      return {
        texto: 'Devuelta ✓',
        clase: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      };
    } else if (estado?.idEstDevolucion === 3) {
      return {
        texto: 'Devolución Rechazada',
        clase: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      };
    }
    
    return {
      texto: 'Desconocido',
      clase: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando entregas...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] dark:bg-[#111827]">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mis Entregas
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona tus entregas de laboratorio y realiza devoluciones
            </p>
          </div>

          {/* Lista de Entregas */}
          {entregas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-400">
                  inventory_2
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No tienes entregas asignadas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cuando se te asigne una entrega de laboratorio, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {entregas.map((entrega) => {
                const estadoBadge = getEstadoBadge(entrega.idEntrega);
                const yaDevuelto = tieneDevolucion(entrega.idEntrega);
                const estadoDevolucion = getEstadoDevolucion(entrega.idEntrega);
                const rechazada = estadoDevolucion?.idEstDevolucion === 3;
                
                return (
                  <div
                    key={entrega.idEntrega}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Header de la tarjeta */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Entrega #{String(entrega.idEntrega).padStart(3, '0')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Pedido #{String(entrega.pedido?.idPedido || 0).padStart(3, '0')}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${estadoBadge.clase}`}>
                          {estadoBadge.texto}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-base mr-2">
                            calendar_today
                          </span>
                          {formatearFechaHora(entrega.fechaEntrega, entrega.horaEntrega)}
                        </div>
                        
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-base mr-2">
                            school
                          </span>
                          {entrega.pedido?.curso?.nombreCurso || 'Curso no especificado'}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/entregas/${entrega.idEntrega}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span className="material-symbols-outlined text-base">
                            visibility
                          </span>
                          Ver Detalle
                        </button>
                        
                        {!yaDevuelto ? (
                          <button
                            onClick={() => iniciarDevolucion(entrega.idEntrega)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#34D399] hover:bg-[#2ab885] rounded-lg"
                          >
                            <span className="material-symbols-outlined text-base">
                              assignment_return
                            </span>
                            Devolver
                          </button>
                        ) : rechazada ? (
                          <button
                            onClick={() => iniciarDevolucion(entrega.idEntrega)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-base">
                              refresh
                            </span>
                            Reintentar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-base">
                              check_circle
                            </span>
                            Procesada
                          </button>
                        )}
                      </div>
                      
                      {/* Mensaje si está rechazada */}
                      {rechazada && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">
                              info
                            </span>
                            Tu devolución fue rechazada. Puedes intentar nuevamente.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MisEntregas;
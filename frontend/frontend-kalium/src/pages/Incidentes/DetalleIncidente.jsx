import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { incidenteService } from '../../services/api';

const DetalleIncidente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incidente, setIncidente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModalResolver, setShowModalResolver] = useState(false);
  const [showModalRevision, setShowModalRevision] = useState(false);
  const [showModalCancelar, setShowModalCancelar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    cargarIncidente();
  }, [id]);

  const cargarIncidente = async () => {
    try {
      setLoading(true);
      const response = await incidenteService.getIncidenteById(id);
      setIncidente(response.data);
    } catch (error) {
      console.error('Error al cargar incidente:', error);
      alert('No se pudo cargar el incidente');
      navigate('/incidentes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async () => {
    try {
      await incidenteService.resolverIncidente(id);
      setShowModalResolver(false);
      setSuccessMessage('El incidente ha sido marcado como resuelto exitosamente.');
      setShowSuccess(true);
      await cargarIncidente();
    } catch (error) {
      console.error('Error al resolver incidente:', error);
      alert('No se pudo resolver el incidente');
    }
  };

  const handlePonerEnRevision = async () => {
    try {
      await incidenteService.cambiarEstado(id, 2); // 2 = En Revisión
      setShowModalRevision(false);
      setSuccessMessage('El incidente ha sido puesto en revisión exitosamente.');
      setShowSuccess(true);
      await cargarIncidente();
    } catch (error) {
      console.error('Error al poner en revisión:', error);
      alert('No se pudo cambiar el estado del incidente');
    }
  };

  const handleCancelar = async () => {
    try {
      await incidenteService.cambiarEstado(id, 4); // 4 = Cancelado
      setShowModalCancelar(false);
      setSuccessMessage('El incidente ha sido cancelado exitosamente.');
      setShowSuccess(true);
      await cargarIncidente();
    } catch (error) {
      console.error('Error al cancelar incidente:', error);
      alert('No se pudo cancelar el incidente');
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Reportado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'En Revisión': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando detalle del incidente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!incidente) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Incidente no encontrado</p>
        </div>
      </div>
    );
  }

  const estadoActual = incidente.estIncidente?.estadoIncidente;
  const esResuelto = estadoActual === 'Resuelto';
  const esCancelado = estadoActual === 'Cancelado';
  const esReportado = estadoActual === 'Reportado';
  const esEnRevision = estadoActual === 'En Revisión';
  const puedeModificar = !esResuelto && !esCancelado;

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header con botón volver */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/incidentes')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Detalle del Incidente #INC{String(incidente.idIncidentes).padStart(3, '0')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Información completa del incidente reportado
              </p>
            </div>
          </div>

          {/* Card de información del incidente */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Información del Incidente
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getEstadoBadge(estadoActual)}`}>
                      {estadoActual || 'Sin estado'}
                    </span>
                  </div>
                </div>

                {/* Botones de acción según el estado */}
                {puedeModificar && (
                  <div className="flex gap-2">
                    {/* Botón Poner en Revisión - solo si está Reportado */}
                    {esReportado && (
                      <button
                        onClick={() => setShowModalRevision(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400"
                      >
                        <span className="material-symbols-outlined text-base">rate_review</span>
                        En Revisión
                      </button>
                    )}

                    {/* Botón Resolver - si está Reportado o En Revisión */}
                    {(esReportado || esEnRevision) && (
                      <button
                        onClick={() => setShowModalResolver(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400"
                      >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Resolver
                      </button>
                    )}

                    {/* Botón Cancelar - siempre disponible si no está Resuelto ni Cancelado */}
                    <button
                      onClick={() => setShowModalCancelar(true)}
                      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del incidente en grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Descripción
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {incidente.descripcion}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Estudiante
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {incidente.estudiante?.nombre} {incidente.estudiante?.apellido}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fecha del Incidente
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {incidente.fechaIncidente ? new Date(incidente.fechaIncidente).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fecha de Solución
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {incidente.fechaSolucion ? new Date(incidente.fechaSolucion).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Pendiente'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Devolución Asociada
                  </p>
                  <button
                    onClick={() => navigate(`/devoluciones/${incidente.devolucion?.idDevolucion}`)}
                    className="text-base font-semibold text-[rgb(44,171,91)] hover:underline"
                  >
                    #DEV{String(incidente.devolucion?.idDevolucion || 0).padStart(3, '0')}
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Estado del Incidente
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {estadoActual || 'Sin estado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón volver */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/incidentes')}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Volver a Incidentes
            </button>
          </div>
        </div>
      </main>

      {/* Modal Poner en Revisión */}
      {showModalRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">
                  rate_review
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Poner en Revisión
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Desea marcar este incidente como "En Revisión"?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModalRevision(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePonerEnRevision}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Resolver */}
      {showModalResolver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">
                  check_circle
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Resolver Incidente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro de marcar este incidente como resuelto? Se establecerá la fecha de solución automáticamente.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModalResolver(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResolver}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Cancelar */}
      {showModalCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
                  cancel
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cancelar Incidente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro de cancelar este incidente? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModalCancelar(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  No, volver
                </button>
                <button
                  onClick={handleCancelar}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                  check
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Éxito!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccess(false)}
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

export default DetalleIncidente;
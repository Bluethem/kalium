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
      const errorMsg = error.response?.data || 'No se pudo resolver el incidente. Debe estar EN REVISIÓN primero.';
      alert(errorMsg);
    }
  };

  const handlePonerEnRevision = async () => {
    try {
      await incidenteService.ponerEnRevision(id);
      setShowModalRevision(false);
      setSuccessMessage('El incidente ha sido puesto en revisión exitosamente.');
      setShowSuccess(true);
      await cargarIncidente();
    } catch (error) {
      console.error('Error al poner en revisión:', error);
      const errorMsg = error.response?.data || 'No se pudo cambiar el estado del incidente';
      alert(errorMsg);
    }
  };

  const handleCancelar = async () => {
    try {
      await incidenteService.cancelarIncidente(id);
      setShowModalCancelar(false);
      setSuccessMessage('El incidente ha sido cancelado exitosamente.');
      setShowSuccess(true);
      await cargarIncidente();
    } catch (error) {
      console.error('Error al cancelar incidente:', error);
      const errorMsg = error.response?.data || 'No se pudo cancelar el incidente';
      alert(errorMsg);
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
  const idEstadoActual = incidente.estIncidente?.idEstIncidente;
  const esReportado = idEstadoActual === 1;
  const esEnRevision = idEstadoActual === 2;
  const esResuelto = idEstadoActual === 3;
  const esCancelado = idEstadoActual === 4;

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <button
              onClick={() => navigate('/incidentes')}
              className="mb-4 text-[rgb(44,171,91)] hover:underline flex items-center gap-2"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Volver a Incidentes
            </button>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Detalle del Incidente #{incidente.idIncidentes}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Información completa del incidente reportado
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getEstadoBadge(estadoActual)}`}>
                {estadoActual}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Descripción del Incidente
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {incidente.descripcion}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Fecha de Incidente</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {incidente.fechaIncidente || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Fecha de Solución</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {incidente.fechaSolucion || 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Estudiante Responsable
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {incidente.estudiante?.usuario?.nombre} {incidente.estudiante?.usuario?.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {incidente.estudiante?.usuario?.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {incidente.devolucion && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Relacionado con Devolución
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Devolución</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    #DEV{String(incidente.devolucion.idDevolucion).padStart(3, '0')}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/devoluciones/${incidente.devolucion.idDevolucion}`)}
                  className="text-[rgb(44,171,91)] hover:underline text-sm font-semibold"
                >
                  Ver Devolución →
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Acciones
            </h3>
            
            {esReportado && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ⚠️ Este incidente está <strong>REPORTADO</strong> y aún no ha sido revisado.
                </p>
                <button
                  onClick={() => setShowModalRevision(true)}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  🔍 Poner en Revisión
                </button>
                <button
                  onClick={() => setShowModalCancelar(true)}
                  className="w-full border-2 border-red-600 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
                >
                  ❌ Cancelar Incidente
                </button>
              </div>
            )}
            
            {esEnRevision && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  🔍 Este incidente está <strong>EN REVISIÓN</strong>. Ya puedes resolverlo o cancelarlo.
                </p>
                <button
                  onClick={() => setShowModalResolver(true)}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  ✅ Resolver Incidente
                </button>
                <button
                  onClick={() => setShowModalCancelar(true)}
                  className="w-full border-2 border-red-600 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
                >
                  ❌ Cancelar Incidente
                </button>
              </div>
            )}
            
            {esResuelto && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                <p className="text-green-800 dark:text-green-300 font-semibold">
                  ✅ Este incidente ya fue RESUELTO el {incidente.fechaSolucion || 'N/A'}
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                  No se pueden realizar más acciones sobre incidentes resueltos.
                </p>
              </div>
            )}
            
            {esCancelado && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-800 dark:text-red-300 font-semibold">
                  ❌ Este incidente fue CANCELADO
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                  No se pueden realizar más acciones sobre incidentes cancelados.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModalRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              🔍 Poner en Revisión
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              ¿Deseas poner este incidente en estado de <strong>REVISIÓN</strong>? Esto significa que comenzarás a investigar y analizar el caso.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModalRevision(false)}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handlePonerEnRevision}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 font-semibold"
              >
                Sí, Poner en Revisión
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalResolver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-green-600">
              ✅ Resolver Incidente
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              ¿Estás seguro de marcar este incidente como <strong>RESUELTO</strong>? Esta acción es final y no se puede revertir. Se establecerá la fecha de solución automáticamente.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModalResolver(false)}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolver}
                className="flex-1 bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 font-semibold"
              >
                Sí, Resolver
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              ❌ Cancelar Incidente
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              ¿Estás seguro de <strong>CANCELAR</strong> este incidente? Esto significa que era un error o no procede. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModalCancelar(false)}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                No, Volver
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 bg-red-600 text-white rounded-lg px-4 py-3 hover:bg-red-700 font-semibold"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                  check_circle
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
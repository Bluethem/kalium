import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { devolucionService, entregaService, estDevolucionService } from '../../services/api';

const DetalleDevolucion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [devolucion, setDevolucion] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [insumosEntrega, setInsumosEntrega] = useState([]);
  const [insumosDevueltos, setInsumosDevueltos] = useState([]);
  const [estadosDevolucion, setEstadosDevolucion] = useState([]);
  const [procesandoInsumo, setProcesandoInsumo] = useState(null);
  const [todosRevisados, setTodosRevisados] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModalAprobar, setShowModalAprobar] = useState(false);
  const [showModalRechazar, setShowModalRechazar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Estados para cada insumo (solo para UI, el admin los marca)
  const [estadosInsumo, setEstadosInsumo] = useState({});
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    if (id) {
      cargarDevolucion();
    }
  }, [id]);

  const cargarDevolucion = async () => {
    try {
      setLoading(true);
      const [devRes, estadosRes] = await Promise.all([
        devolucionService.getDevolucionById(id),
        estDevolucionService.getEstados()
      ]);

      setDevolucion(devRes.data);
      setEntrega(devRes.data.entrega);
      setEstadosDevolucion(estadosRes.data || []);

      await cargarInsumosEntrega(devRes.data.entrega.idEntrega);
      await cargarInsumosDevueltos(id);
      await verificarRevisados();
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('No se pudo cargar la devolución');
      setShowError(true);
      setTimeout(() => navigate('/devoluciones'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const cargarInsumosEntrega = async (idEntrega) => {
    try {
      const response = await entregaService.getInsumosPorEntrega(idEntrega);
      setInsumosEntrega(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarInsumosDevueltos = async (idDevolucion) => {
    try {
      const response = await devolucionService.getDetalles(idDevolucion);
      setInsumosDevueltos(response.data || []);
      
      // Cargar estados actuales
      const estadosIniciales = {};
      const obsIniciales = {};
      (response.data || []).forEach(detalle => {
        estadosIniciales[detalle.insumo.idInsumo] = detalle.estadoInsumoDevuelto || 'NO_REVISADO';
        obsIniciales[detalle.insumo.idInsumo] = detalle.observaciones || '';
      });
      setEstadosInsumo(estadosIniciales);
      setObservaciones(obsIniciales);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const verificarRevisados = async () => {
    try {
      const response = await devolucionService.verificarRevisados(id);
      setTodosRevisados(response.data);
    } catch (error) {
      console.error('Error al verificar revisados:', error);
      setTodosRevisados(false);
    }
  };

  const handleRevisarInsumo = async (idInsumo, estado) => {
    if (!devolucion || devolucion.estDevolucion?.idEstDevolucion !== 1) {
      setErrorMessage('Solo se pueden revisar devoluciones en estado PENDIENTE');
      setShowError(true);
      return;
    }

    try {
      setProcesandoInsumo(idInsumo);

      // Actualizar estado local primero
      setEstadosInsumo(prev => ({ ...prev, [idInsumo]: estado }));

      const nuevoDetalle = {
        devolucion: { idDevolucion: devolucion.idDevolucion },
        insumo: { idInsumo },
        estadoInsumoDevuelto: estado,
        observaciones: observaciones[idInsumo] || ''
      };

      await devolucionService.agregarDetalle(nuevoDetalle);

      // Recargar datos
      await cargarInsumosDevueltos(id);
      await verificarRevisados();

      if (estado === 'DAÑADO' || estado === 'FALTANTE') {
        setSuccessMessage(`⚠️ Insumo marcado como ${estado}. Incidencia generada automáticamente.`);
      } else {
        setSuccessMessage(`✅ Insumo marcado como ${estado}`);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al revisar el insumo');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setProcesandoInsumo(null);
    }
  };

  const handleAprobar = async () => {
    if (!todosRevisados) {
      setErrorMessage('Debes revisar TODOS los insumos antes de aprobar');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      await devolucionService.aprobarDevolucion(id);
      setSuccessMessage('✅ Devolución APROBADA correctamente');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/devoluciones');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al aprobar la devolución');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
    setShowModalAprobar(false);
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      setErrorMessage('Debes especificar un motivo de rechazo');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      await devolucionService.rechazarDevolucion(id, motivoRechazo);
      setSuccessMessage('✅ Devolución RECHAZADA');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/devoluciones');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al rechazar la devolución');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
    setShowModalRechazar(false);
    setMotivoRechazo('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </main>
      </div>
    );
  }

  if (!devolucion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">Devolución no encontrada</div>
        </main>
      </div>
    );
  }

  const estadoBgColor = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Aprobada': 'bg-green-100 text-green-800',
    'Rechazada': 'bg-red-100 text-red-800',
    'En revision': 'bg-blue-100 text-blue-800'
  };

  const esPendiente = devolucion.estDevolucion?.idEstDevolucion === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/devoluciones')}
              className="mb-4 text-[rgb(44,171,91)] hover:underline flex items-center gap-2"
            >
              ← Volver a Devoluciones
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Devolución #{String(devolucion.idDevolucion).padStart(3, '0')}
            </h1>
            <p className="text-gray-600 mt-1">
              Revisar y aprobar devolución de insumos
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${estadoBgColor[devolucion.estDevolucion?.estadoDevolucion] || 'bg-gray-100 text-gray-800'}`}>
            {devolucion.estDevolucion?.estadoDevolucion || 'Sin estado'}
          </span>
        </div>

        {/* Información de la Entrega */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📦 Información de la Entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Entrega</p>
              <p className="font-semibold">#ENT{String(entrega?.idEntrega).padStart(3, '0')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estudiante</p>
              <p className="font-semibold">
                {entrega?.estudiante?.usuario?.nombre || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Devolución</p>
              <p className="font-semibold">{devolucion.fechaDevolucion}</p>
            </div>
          </div>
        </div>

        {/* Insumos a Revisar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">🔍 Revisar Insumos</h2>
            {esPendiente && (
              <div className="text-sm">
                <span className={`px-3 py-1 rounded-full ${todosRevisados ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {todosRevisados ? '✅ Todos Revisados' : '⏳ Pendiente de Revisión'}
                </span>
              </div>
            )}
          </div>

          {insumosEntrega.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay insumos en esta entrega</p>
          ) : (
            <div className="space-y-4">
              {insumosEntrega.map((item) => {
                const insumo = item.insumo;
                const yaDevuelto = insumosDevueltos.find(d => d.insumo?.idInsumo === insumo.idInsumo);
                const estadoActual = estadosInsumo[insumo.idInsumo] || 'NO_REVISADO';
                const estaProcesando = procesandoInsumo === insumo.idInsumo;

                return (
                  <div key={insumo.idInsumo} className="border rounded-lg p-4 hover:border-[rgb(44,171,91)] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {insumo.tipoInsumo?.nombreTipoInsumo || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-gray-600">ID: {insumo.idInsumo}</p>
                        <p className="text-sm text-gray-600">
                          Categoría: {insumo.tipoInsumo?.categoria?.nombreCategoria || 'N/A'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          estadoActual === 'OK' ? 'bg-green-100 text-green-800' :
                          estadoActual === 'DAÑADO' ? 'bg-red-100 text-red-800' :
                          estadoActual === 'FALTANTE' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {estadoActual === 'NO_REVISADO' ? '⏳ NO REVISADO' :
                           estadoActual === 'OK' ? '✅ OK' :
                           estadoActual === 'DAÑADO' ? '❌ DAÑADO' :
                           '⚠️ FALTANTE'}
                        </span>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {esPendiente && estadoActual === 'NO_REVISADO' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observaciones (opcional)
                        </label>
                        <textarea
                          value={observaciones[insumo.idInsumo] || ''}
                          onChange={(e) => setObservaciones(prev => ({
                            ...prev,
                            [insumo.idInsumo]: e.target.value
                          }))}
                          placeholder="Ej: Tiene rayones, falta una pieza, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                          rows="2"
                        />
                      </div>
                    )}

                    {/* Botones de Revisión */}
                    {esPendiente && estadoActual === 'NO_REVISADO' && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleRevisarInsumo(insumo.idInsumo, 'OK')}
                          disabled={estaProcesando}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          {estaProcesando ? '⏳ Procesando...' : '✅ Marcar como OK'}
                        </button>
                        <button
                          onClick={() => handleRevisarInsumo(insumo.idInsumo, 'DAÑADO')}
                          disabled={estaProcesando}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          {estaProcesando ? '⏳ Procesando...' : '❌ Marcar como DAÑADO'}
                        </button>
                        <button
                          onClick={() => handleRevisarInsumo(insumo.idInsumo, 'FALTANTE')}
                          disabled={estaProcesando}
                          className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          {estaProcesando ? '⏳ Procesando...' : '⚠️ Marcar como FALTANTE'}
                        </button>
                      </div>
                    )}

                    {/* Mostrar observaciones si ya fue revisado */}
                    {yaDevuelto && yaDevuelto.observaciones && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Observaciones:</p>
                        <p className="text-sm text-gray-600">{yaDevuelto.observaciones}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        {esPendiente && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowModalRechazar(true)}
                className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors"
              >
                ❌ Rechazar Devolución
              </button>
              <button
                onClick={() => setShowModalAprobar(true)}
                disabled={!todosRevisados}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  todosRevisados
                    ? 'bg-[rgb(44,171,91)] text-white hover:bg-[rgb(39,153,82)]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!todosRevisados ? 'Debes revisar todos los insumos primero' : ''}
              >
                ✅ Aprobar Devolución
              </button>
            </div>
            {!todosRevisados && (
              <p className="text-sm text-gray-600 text-right mt-2">
                ⚠️ Debes revisar todos los insumos antes de aprobar
              </p>
            )}
          </div>
        )}

        {/* Información de Estado */}
        {!esPendiente && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-blue-900 font-semibold">
              Esta devolución ya fue {devolucion.estDevolucion?.estadoDevolucion?.toLowerCase()}
            </p>
          </div>
        )}
      </main>

      {/* Modal Aprobar */}
      {showModalAprobar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">✅ Aprobar Devolución</h3>
            <p className="mb-6 text-gray-700">
              ¿Está seguro de aprobar esta devolución? Los insumos marcados como OK serán liberados y las incidencias ya fueron generadas automáticamente.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModalAprobar(false)}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprobar}
                className="flex-1 bg-[rgb(44,171,91)] text-white rounded-lg px-4 py-3 hover:bg-[rgb(39,153,82)] font-semibold"
              >
                Sí, Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {showModalRechazar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">❌ Rechazar Devolución</h3>
            <p className="mb-4 text-gray-700">
              Especifica el motivo del rechazo:
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Faltan insumos, están en mal estado, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows="4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowModalRechazar(false);
                  setMotivoRechazo('');
                }}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                className="flex-1 bg-red-600 text-white rounded-lg px-4 py-3 hover:bg-red-700 font-semibold"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 px-6 py-4 rounded-lg shadow-xl animate-slide-in-right">
          <p className="font-semibold text-green-900">{successMessage}</p>
        </div>
      )}

      {showError && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-100 border-l-4 border-red-500 px-6 py-4 rounded-lg shadow-xl animate-slide-in-right">
          <p className="font-semibold text-red-900">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DetalleDevolucion;
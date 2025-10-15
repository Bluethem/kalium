// COPIA TODO ESTE CÓDIGO Y REEMPLAZA EN:
// frontend/frontend-kalium/src/pages/Devoluciones/DetalleDevolucion.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { devolucionService, entregaService, estDevolucionService } from '../../services/api';

const DetalleDevolucion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modoCrear = searchParams.get('crear') === 'true';
  const idEntregaParam = searchParams.get('entrega');

  const [loading, setLoading] = useState(true);
  const [devolucion, setDevolucion] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [insumosEntrega, setInsumosEntrega] = useState([]);
  const [insumosDevueltos, setInsumosDevueltos] = useState([]);
  const [estadosDevolucion, setEstadosDevolucion] = useState([]);
  const [procesandoInsumo, setProcesandoInsumo] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [estadosInsumo, setEstadosInsumo] = useState({});
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    if (modoCrear && idEntregaParam) {
      crearDevolucionDesdeEntrega();
    } else if (id) {
      cargarDevolucion();
    }
  }, [id, modoCrear, idEntregaParam]);

  const crearDevolucionDesdeEntrega = async () => {
    try {
      setLoading(true);
      const entregaRes = await entregaService.getEntregaById(idEntregaParam);
      const entregaData = entregaRes.data;
      setEntrega(entregaData);

      const devolucionesRes = await devolucionService.getDevoluciones();
      const yaDevuelto = devolucionesRes.data.some(d => d.entrega?.idEntrega === parseInt(idEntregaParam));

      if (yaDevuelto) {
        setErrorMessage('Esta entrega ya tiene una devolución registrada');
        setShowError(true);
        setTimeout(() => navigate('/devoluciones'), 2000);
        return;
      }

      const nuevaDevolucion = {
        fechaDevolucion: new Date().toISOString().split('T')[0],
        horaDevolucion: new Date().toISOString().slice(0, 16),
        pedido: { idPedido: entregaData.pedido.idPedido },
        estDevolucion: { idEstDevolucion: 1 },
        entrega: { idEntrega: parseInt(idEntregaParam) }
      };

      const devRes = await devolucionService.createDevolucion(nuevaDevolucion);
      setDevolucion(devRes.data);
      await cargarInsumosEntrega(idEntregaParam);
      
      const estadosRes = await estDevolucionService.getEstados();
      setEstadosDevolucion(estadosRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al crear la devolución');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

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
      
      const estadosIniciales = {};
      const obsIniciales = {};
      (response.data || []).forEach(item => {
        estadosIniciales[item.insumo.idInsumo] = 'OK';
        obsIniciales[item.insumo.idInsumo] = '';
      });
      setEstadosInsumo(estadosIniciales);
      setObservaciones(obsIniciales);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarInsumosDevueltos = async (idDevolucion) => {
    try {
      const response = await devolucionService.getDetalles(idDevolucion);
      setInsumosDevueltos(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const registrarInsumoDevuelto = async (insumo) => {
    if (!devolucion) {
      setErrorMessage('Primero debe crearse la devolución');
      setShowError(true);
      return;
    }

    try {
      setProcesandoInsumo(insumo.idInsumo);

      const detalle = {
        devolucion: { idDevolucion: devolucion.idDevolucion },
        insumo: { idInsumo: insumo.idInsumo },
        estadoInsumoDevuelto: estadosInsumo[insumo.idInsumo] || 'OK',
        observaciones: observaciones[insumo.idInsumo] || null
      };

      await devolucionService.agregarDetalle(detalle);

      await Promise.all([
        cargarInsumosEntrega(entrega.idEntrega),
        cargarInsumosDevueltos(devolucion.idDevolucion)
      ]);

      if (detalle.estadoInsumoDevuelto !== 'OK') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al registrar el insumo');
      setShowError(true);
    } finally {
      setProcesandoInsumo(null);
    }
  };

  const handleEliminar = async () => {
    try {
      await devolucionService.deleteDevolucion(devolucion.idDevolucion);
      navigate('/devoluciones');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('No se pudo eliminar la devolución');
      setShowError(true);
      setShowModalEliminar(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Completa': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Incompleta': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Con Daños': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoInsumoIcon = (estado) => {
    const iconos = {
      'OK': { icon: 'check_circle', color: 'text-green-600' },
      'Dañado': { icon: 'error', color: 'text-red-600' },
      'Perdido': { icon: 'cancel', color: 'text-orange-600' },
    };
    return iconos[estado] || iconos['OK'];
  };

  const insumosNoDevueltos = insumosEntrega.filter(
    item => !insumosDevueltos.some(d => d.insumo.idInsumo === item.insumo.idInsumo)
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)]"></div>
        </div>
      </div>
    );
  }

  if (!devolucion || !entrega) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Devolución no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-4">
            <button onClick={() => navigate('/devoluciones')} className="p-2 rounded-full hover:bg-gray-200">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Devolución #DEV{String(devolucion.idDevolucion).padStart(3, '0')}
              </h2>
            </div>
            <button onClick={() => setShowModalEliminar(true)} className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700">
              <span className="material-symbols-outlined text-base">delete</span>
              Eliminar
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Información General</h3>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getEstadoBadge(devolucion.estDevolucion?.estadoDevolucion)}`}>
                {devolucion.estDevolucion?.estadoDevolucion}
              </span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Estudiante</p>
                <p className="font-semibold">{entrega.estudiante?.nombre} {entrega.estudiante?.apellido}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Entrega</p>
                <button onClick={() => navigate(`/entregas/${entrega.idEntrega}`)} className="font-semibold text-[rgb(44,171,91)] hover:underline">
                  #ENT{String(entrega.idEntrega).padStart(3, '0')}
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha</p>
                <p className="font-semibold">{new Date(devolucion.fechaDevolucion).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>

          {insumosNoDevueltos.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border mb-6">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Insumos Por Devolver ({insumosNoDevueltos.length})</h3>
              </div>
              <div className="p-6 space-y-4">
                {insumosNoDevueltos.map((item) => (
                  <div key={item.insumo.idInsumo} className="border rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{item.insumo.tipoInsumo.nombreTipoInsumo}</p>
                      <p className="text-sm text-gray-500">ID: {item.insumo.idInsumo}</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`estado-${item.insumo.idInsumo}`} value="OK" checked={estadosInsumo[item.insumo.idInsumo] === 'OK'} onChange={(e) => setEstadosInsumo(prev => ({...prev, [item.insumo.idInsumo]: e.target.value}))} />
                        ✅ OK
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`estado-${item.insumo.idInsumo}`} value="Dañado" checked={estadosInsumo[item.insumo.idInsumo] === 'Dañado'} onChange={(e) => setEstadosInsumo(prev => ({...prev, [item.insumo.idInsumo]: e.target.value}))} />
                        ❌ Dañado
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`estado-${item.insumo.idInsumo}`} value="Perdido" checked={estadosInsumo[item.insumo.idInsumo] === 'Perdido'} onChange={(e) => setEstadosInsumo(prev => ({...prev, [item.insumo.idInsumo]: e.target.value}))} />
                        🚫 Perdido
                      </label>
                    </div>
                    <input type="text" placeholder="Observaciones..." value={observaciones[item.insumo.idInsumo] || ''} onChange={(e) => setObservaciones(prev => ({...prev, [item.insumo.idInsumo]: e.target.value}))} className="w-64 rounded-md border px-2 py-1" />
                    <button onClick={() => registrarInsumoDevuelto(item.insumo)} disabled={procesandoInsumo === item.insumo.idInsumo} className="rounded-lg bg-[rgb(44,171,91)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90">
                      Registrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border mb-6">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Insumos Devueltos ({insumosDevueltos.length})</h3>
            </div>
            {insumosDevueltos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No se han registrado insumos devueltos</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Insumo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {insumosDevueltos.map((detalle) => {
                    const estadoIcon = getEstadoInsumoIcon(detalle.estadoInsumoDevuelto);
                    return (
                      <tr key={detalle.idDevolucionDetalle}>
                        <td className="px-6 py-4">
                          <p className="font-semibold">{detalle.insumo.tipoInsumo.nombreTipoInsumo}</p>
                          <p className="text-sm text-gray-500">ID: {detalle.insumo.idInsumo}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`material-symbols-outlined ${estadoIcon.color}`}>{estadoIcon.icon}</span>
                          {detalle.estadoInsumoDevuelto}
                        </td>
                        <td className="px-6 py-4">{detalle.observaciones || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => navigate('/devoluciones')} className="rounded-lg border px-6 py-2">Volver</button>
          </div>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-50 bg-orange-100 border-l-4 border-orange-500 px-6 py-4 rounded-lg shadow-xl">
          <p className="font-semibold text-orange-900">⚠️ Incidencia Generada Automáticamente</p>
        </div>
      )}

      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h3 className="text-xl font-bold mb-4">Error</h3>
            <p className="mb-6">{errorMessage}</p>
            <button onClick={() => setShowError(false)} className="w-full rounded-lg bg-[rgb(44,171,91)] px-6 py-3 text-white">Aceptar</button>
          </div>
        </div>
      )}

      {showModalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h3 className="text-xl font-bold mb-4">Eliminar Devolución</h3>
            <p className="mb-6">¿Está seguro? Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowModalEliminar(false)} className="flex-1 border rounded-lg px-4 py-2">Cancelar</button>
              <button onClick={handleEliminar} className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleDevolucion;

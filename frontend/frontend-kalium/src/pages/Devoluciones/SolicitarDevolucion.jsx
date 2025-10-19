import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { devolucionService, entregaService } from '../../services/api';

const SolicitarDevolucion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idEntregaParam = searchParams.get('entrega');

  const [loading, setLoading] = useState(true);
  const [entrega, setEntrega] = useState(null);
  const [insumosEntrega, setInsumosEntrega] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (idEntregaParam) {
      cargarEntrega();
    }
  }, [idEntregaParam]);

  const cargarEntrega = async () => {
    try {
      setLoading(true);

      // Verificar si ya existe una devolución para esta entrega
      const devolucionesRes = await devolucionService.getDevoluciones();
      const yaDevuelto = devolucionesRes.data.some(
        d => d.entrega?.idEntrega === parseInt(idEntregaParam)
      );

      if (yaDevuelto) {
        setErrorMessage('Esta entrega ya tiene una devolución registrada');
        setShowError(true);
        setTimeout(() => navigate('/mis-entregas'), 2000);
        return;
      }

      // Cargar datos de la entrega
      const entregaRes = await entregaService.getEntregaById(idEntregaParam);
      setEntrega(entregaRes.data);

      // Cargar insumos de la entrega
      const insumosRes = await entregaService.getInsumosPorEntrega(idEntregaParam);
      setInsumosEntrega(insumosRes.data || []);

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al cargar la entrega');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitar = async () => {
    if (!entrega) return;

    setProcesando(true);
    try {
      // Crear la devolución
      const nuevaDevolucion = {
        fechaDevolucion: new Date().toISOString().split('T')[0],
        horaDevolucion: new Date().toISOString().slice(0, 16),
        pedido: { idPedido: entrega.pedido.idPedido },
        estDevolucion: { idEstDevolucion: 1 }, // Pendiente
        entrega: { idEntrega: entrega.idEntrega }
      };

      const devRes = await devolucionService.createDevolucion(nuevaDevolucion);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/mis-entregas');
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data || 'Error al solicitar la devolución');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setProcesando(false);
    }
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

  if (!entrega) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">Entrega no encontrada</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/mis-entregas')}
            className="mb-4 text-[rgb(44,171,91)] hover:underline flex items-center gap-2"
          >
            ← Volver a Mis Entregas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            📦 Solicitar Devolución
          </h1>
          <p className="text-gray-600 mt-1">
            Solicita la devolución de los insumos de tu entrega
          </p>
        </div>

        {/* Información de la Entrega */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Información de la Entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Entrega</p>
              <p className="font-semibold">#ENT{String(entrega.idEntrega).padStart(3, '0')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedido</p>
              <p className="font-semibold">#PED{String(entrega.pedido?.idPedido).padStart(3, '0')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Entrega</p>
              <p className="font-semibold">{entrega.fechaEntrega}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold text-green-600">Entregado</p>
            </div>
          </div>
        </div>

        {/* Insumos a Devolver */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔬 Insumos a Devolver</h2>
          
          {insumosEntrega.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay insumos en esta entrega</p>
          ) : (
            <div className="space-y-3">
              {insumosEntrega.map((item) => {
                const insumo = item.insumo;
                return (
                  <div key={insumo.idInsumo} className="border rounded-lg p-4 hover:border-[rgb(44,171,91)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {insumo.tipoInsumo?.nombreTipoInsumo || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {insumo.tipoInsumo?.categoria?.nombreCategoria || 'Sin categoría'} • ID: {insumo.idInsumo}
                        </p>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-blue-900 mb-2">📋 Instrucciones</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Al solicitar esta devolución, deberás entregar TODOS los insumos físicamente al administrador</li>
            <li>• El administrador revisará el estado de cada insumo</li>
            <li>• Si algún insumo está dañado o faltante, se generará una incidencia automáticamente</li>
            <li>• Recibirás una notificación cuando tu devolución sea aprobada o rechazada</li>
          </ul>
        </div>

        {/* Botón de Acción */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => navigate('/mis-entregas')}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSolicitar}
              disabled={procesando || insumosEntrega.length === 0}
              className="px-6 py-3 bg-[rgb(44,171,91)] text-white rounded-lg hover:bg-[rgb(39,153,82)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {procesando ? '⏳ Procesando...' : '📦 Solicitar Devolución'}
            </button>
          </div>
        </div>
      </main>

      {/* Notificaciones */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">¡Devolución Solicitada!</h3>
            <p className="text-gray-600 mb-4">
              Tu solicitud de devolución ha sido registrada. El administrador revisará los insumos y te notificará cuando sea aprobada.
            </p>
            <p className="text-sm text-gray-500">Redirigiendo a Mis Entregas...</p>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-100 border-l-4 border-red-500 px-6 py-4 rounded-lg shadow-xl">
          <p className="font-semibold text-red-900">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default SolicitarDevolucion;
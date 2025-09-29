import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Header from '../../components/Layout/Header';
import { insumoService } from '../../services/api';

const DetalleInsumo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tipoInsumo, setTipoInsumo] = useState(null);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar tipo de insumo y sus instancias
      const [tipoRes, insumosRes] = await Promise.all([
        insumoService.getTiposInsumo(),
        insumoService.getInsumosPorTipo(id)
      ]);
      
      const tipo = tipoRes.data.find(t => t.idTipoInsumo === parseInt(id));
      setTipoInsumo(tipo);
      setInsumos(insumosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'Disponible': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'En Uso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Agotado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'En Mantenimiento': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14378f] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tipoInsumo) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Insumo no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botón de regreso */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/insumos')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalle del Insumo: {tipoInsumo.nombreTipoInsumo}
          </h2>
        </div>

        {/* Card principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Header del card */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 p-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Instancias de Insumo</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tipo de Insumo ID: {tipoInsumo.idTipoInsumo}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {tipoInsumo.descripcion}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Categoría: {tipoInsumo.categoria?.nombreCategoria} | Unidad: {tipoInsumo.unidad?.unidad}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Edit size={16} />
                <span>Editar Tipo</span>
              </button>
              <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                <Trash2 size={16} />
                <span>Eliminar Tipo</span>
              </button>
            </div>
          </div>

          {/* Tabla de instancias */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">ID del Insumo</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay instancias de este insumo
                    </td>
                  </tr>
                ) : (
                  insumos.map((insumo) => (
                    <tr key={insumo.idInsumo} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        INS-{String(insumo.idInsumo).padStart(3, '0')}
                      </th>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(insumo.estInsumo?.nombreEstInsumo)}`}>
                          {insumo.estInsumo?.nombreEstInsumo || 'Sin estado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#14378f] dark:hover:text-[#14378f]">
                            <Edit size={16} />
                            <span>Editar</span>
                          </button>
                          <button className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400">
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalleInsumo;

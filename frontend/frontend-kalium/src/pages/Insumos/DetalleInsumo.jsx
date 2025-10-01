import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { insumoService, quimicoService } from '../../services/api';
import axios from 'axios';

const DetalleInsumo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tipoInsumo, setTipoInsumo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [itemEditando, setItemEditando] = useState(null);
  const [accionRealizada, setAccionRealizada] = useState(''); // 'editar' o 'eliminar'
  const [itemEliminar, setItemEliminar] = useState(null);
  const [estadosInsumo, setEstadosInsumo] = useState([]);

  // Form data para editar
  const [formEdit, setFormEdit] = useState({
    idEstInsumo: '',
    cantQuimico: '',
    fechaIngreso: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const tipoRes = await insumoService.getTiposInsumoConStock();
      const tipo = tipoRes.data.find(t => t.idTipoInsumo === parseInt(id));
      setTipoInsumo(tipo);
      
      const estadosRes = await axios.get('http://localhost:8080/api/estados-insumo');
      setEstadosInsumo(estadosRes.data);
      
      if (tipo) {
        if (tipo.esQuimico) {
          const quimicosRes = await quimicoService.getQuimicosPorTipo(id);
          setItems(quimicosRes.data);
        } else {
          const insumosRes = await insumoService.getInsumosPorTipo(id);
          setItems(insumosRes.data);
        }
      }
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
      'En Tránsito': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Entregado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Reservado': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Agotado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'En Mantenimiento': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const handleEliminar = (item) => {
    setItemEliminar(item);
    setShowConfirmDelete(true);
  };

  const confirmarEliminacion = async () => {
    try {
      if (tipoInsumo.esQuimico) {
        await quimicoService.deleteQuimico(itemEliminar.idQuimico);
      } else {
        await insumoService.deleteInsumo(itemEliminar.idInsumo);
      }
      setShowConfirmDelete(false);
      setItemEliminar(null);
      setAccionRealizada('eliminar'); // Agregar esta línea
      setShowSuccess(true);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setShowConfirmDelete(false);
      setErrorMessage(error.response?.data || error.message);
      setShowError(true);
    }
  };

  const handleEditar = (item) => {
    setItemEditando(item);
    if (tipoInsumo.esQuimico) {
      setFormEdit({
        cantQuimico: item.cantQuimico,
        fechaIngreso: item.fechaIngreso
      });
    } else {
      setFormEdit({
        idEstInsumo: item.estInsumo?.idEstInsumo || '',
        fechaIngreso: item.fechaIngreso
      });
    }
    setShowModal(true);
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setFormEdit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      if (tipoInsumo.esQuimico) {
        const quimicoData = {
          idQuimico: itemEditando.idQuimico,
          cantQuimico: parseFloat(formEdit.cantQuimico),
          tipoInsumo: itemEditando.tipoInsumo,
          fechaIngreso: formEdit.fechaIngreso
        };
        await quimicoService.updateQuimico(itemEditando.idQuimico, quimicoData);
      } else {
        const insumoData = {
          idInsumo: itemEditando.idInsumo,
          estInsumo: { idEstInsumo: parseInt(formEdit.idEstInsumo) },
          tipoInsumo: itemEditando.tipoInsumo,
          fechaIngreso: formEdit.fechaIngreso
        };
        await insumoService.updateInsumo(itemEditando.idInsumo, insumoData);
      }
      setShowModal(false);
      setItemEditando(null);
      setAccionRealizada('editar'); // Agregar esta línea
      setShowSuccess(true);
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar:', error);
      setShowModal(false);
      setErrorMessage(error.response?.data || error.message);
      setShowError(true);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setItemEditando(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/insumos')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tipoInsumo.nombreTipoInsumo}
            </h2>
            {tipoInsumo.esQuimico ? (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Químico
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Insumo Físico
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {tipoInsumo.esQuimico ? 'Instancias de Químico' : 'Instancias de Insumo'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {tipoInsumo.idTipoInsumo}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {tipoInsumo.descripcion}
              </p>
              <div className="flex gap-4 mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Categoría:</span> {tipoInsumo.categoria?.nombreCategoria}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Unidad:</span> {tipoInsumo.unidad?.unidad}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Cantidad Total:</span> {tipoInsumo.cantidadTotal} {tipoInsumo.unidad?.unidad}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  {tipoInsumo.esQuimico ? (
                    <>
                      <th scope="col" className="px-6 py-3">Cantidad</th>
                      <th scope="col" className="px-6 py-3">Fecha Ingreso</th>
                    </>
                  ) : (
                    <>
                      <th scope="col" className="px-6 py-3">Estado</th>
                      <th scope="col" className="px-6 py-3">Fecha Ingreso</th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay instancias de este {tipoInsumo.esQuimico ? 'químico' : 'insumo'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={tipoInsumo.esQuimico ? item.idQuimico : item.idInsumo} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {tipoInsumo.esQuimico 
                          ? `QUI-${String(item.idQuimico).padStart(3, '0')}`
                          : `INS-${String(item.idInsumo).padStart(3, '0')}`
                        }
                      </th>
                      {tipoInsumo.esQuimico ? (
                        <>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {item.cantQuimico} {tipoInsumo.unidad?.unidad}
                          </td>
                          <td className="px-6 py-4">
                            {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleDateString('es-ES') : 'N/A'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(item.estInsumo?.nombreEstInsumo)}`}>
                              {item.estInsumo?.nombreEstInsumo || 'Sin estado'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleDateString('es-ES') : 'N/A'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditar(item)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span>Editar</span>
                          </button>
                          <button 
                            onClick={() => handleEliminar(item)}
                            className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
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

      {/* Modal de Confirmación de Eliminación */}
      {showConfirmDelete && itemEliminar && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="material-symbols-outlined text-red-600 dark:text-red-500 text-3xl">
                  warning
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                Eliminar {tipoInsumo.esQuimico ? 'Químico' : 'Insumo Físico'}
              </h3>
              <div className="mt-2 px-4">
                <p className="text-base text-gray-600 dark:text-gray-400">
                  ¿Estás seguro de que quieres eliminar {tipoInsumo.esQuimico ? 'el químico' : 'el insumo físico'} con ID:{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tipoInsumo.esQuimico 
                      ? `QUI-${String(itemEliminar.idQuimico).padStart(3, '0')}`
                      : `INS-${String(itemEliminar.idInsumo).padStart(3, '0')}`
                    }
                  </span>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setItemEliminar(null);
                }}
                className="w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14378f]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="w-full inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-8 text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-500" style={{fontSize: '40px'}}>
                    check_circle
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {accionRealizada === 'editar' ? 'Edición Exitosa' : 'Eliminación Exitosa'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {accionRealizada === 'editar'
                  ? `El ${tipoInsumo.esQuimico ? 'químico' : 'insumo'} ha sido actualizado correctamente.`
                  : `El ${tipoInsumo.esQuimico ? 'químico' : 'insumo'} ha sido eliminado correctamente.`}
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setAccionRealizada('');
                }}
                className="w-full px-6 py-3 rounded-lg text-sm font-bold bg-[rgb(44,171,91)] text-white hover:bg-opacity-90 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error */}
      {showError && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-8 text-center">
              <div className="flex justify-center items-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-500" style={{fontSize: '64px'}}>
                  error
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Error al {accionRealizada === 'editar' ? 'actualizar' : 'eliminar'} {tipoInsumo.esQuimico ? 'químico' : 'insumo'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {errorMessage || 'Ha ocurrido un problema al intentar guardar los cambios. Por favor, inténtelo de nuevo.'}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowError(false);
                    setErrorMessage('');
                    setAccionRealizada('');
                  }}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-[rgb(44,171,91)] text-white hover:bg-opacity-90 transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showModal && itemEditando && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {tipoInsumo.esQuimico ? 'Editar Químico' : 'Editar Insumo Físico'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {tipoInsumo.esQuimico ? 'ID del Químico' : 'ID del Insumo'}
                </label>
                <input
                  type="text"
                  disabled
                  value={tipoInsumo.esQuimico 
                    ? `QUI-${String(itemEditando.idQuimico).padStart(3, '0')}`
                    : `INS-${String(itemEditando.idInsumo).padStart(3, '0')}`
                  }
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed text-gray-500 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {tipoInsumo.esQuimico ? 'Nombre del Tipo de Químico' : 'Nombre del Tipo de Insumo'}
                </label>
                <input
                  type="text"
                  disabled
                  value={tipoInsumo.nombreTipoInsumo}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed text-gray-500 dark:text-gray-400"
                />
              </div>

              {tipoInsumo.esQuimico ? (
                <div>
                  <label htmlFor="cantQuimico" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cantidad ({tipoInsumo.unidad?.unidad})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="cantQuimico"
                    name="cantQuimico"
                    value={formEdit.cantQuimico}
                    onChange={handleChangeEdit}
                    required
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14378f] text-gray-900 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="idEstInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    id="idEstInsumo"
                    name="idEstInsumo"
                    value={formEdit.idEstInsumo}
                    onChange={handleChangeEdit}
                    required
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14378f] text-gray-900 dark:text-white"
                  >
                    {estadosInsumo.map(estado => (
                      <option key={estado.idEstInsumo} value={estado.idEstInsumo}>
                        {estado.nombreEstInsumo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="fechaIngreso" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  id="fechaIngreso"
                  name="fechaIngreso"
                  value={formEdit.fechaIngreso}
                  onChange={handleChangeEdit}
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14378f] text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[rgb(44,171,91)] text-white hover:bg-opacity-90 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleInsumo;
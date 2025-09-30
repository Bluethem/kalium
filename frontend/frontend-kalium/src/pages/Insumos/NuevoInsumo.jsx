import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { insumoService } from '../../services/api';
import axios from 'axios';

const NuevoInsumo = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreTipoInsumo: '',
    descripcion: '',
    idCategoria: '',
    idUnidad: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [categoriasRes, unidadesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/categorias'),
        axios.get('http://localhost:8080/api/unidades')
      ]);
      setCategorias(categoriasRes.data);
      setUnidades(unidadesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tipoInsumoData = {
        nombreTipoInsumo: formData.nombreTipoInsumo,
        descripcion: formData.descripcion,
        categoria: { idCategoria: parseInt(formData.idCategoria) },
        unidad: { idUnidad: parseInt(formData.idUnidad) }
      };

      await insumoService.createTipoInsumo(tipoInsumoData);
      alert('Insumo creado exitosamente');
      navigate('/insumos');
    } catch (error) {
      console.error('Error al crear insumo:', error);
      alert('Error al crear el insumo: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
              Agregar Nuevo Insumo
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <div className="space-y-4">
              <div>
                <label htmlFor="nombreTipoInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del Insumo
                </label>
                <input
                  type="text"
                  id="nombreTipoInsumo"
                  name="nombreTipoInsumo"
                  value={formData.nombreTipoInsumo}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label htmlFor="idCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoría
                </label>
                <select
                  id="idCategoria"
                  name="idCategoria"
                  value={formData.idCategoria}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm rounded-md"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="idUnidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unidad
                </label>
                <select
                  id="idUnidad"
                  name="idUnidad"
                  value={formData.idUnidad}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-[#14378f] focus:border-[#14378f] sm:text-sm rounded-md"
                >
                  <option value="">Seleccionar unidad</option>
                  {unidades.map(unidad => (
                    <option key={unidad.idUnidad} value={unidad.idUnidad}>
                      {unidad.unidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/insumos')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(44,171,91)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(44,171,91)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(44,171,91)] disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>  
  );
};

export default NuevoInsumo;

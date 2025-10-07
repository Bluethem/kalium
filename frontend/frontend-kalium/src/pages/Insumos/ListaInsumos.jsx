import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insumoService } from '../../services/api';
import Header from '../../components/Layout/Header';
import axios from 'axios';

const ListaInsumos = () => {
  const navigate = useNavigate();
  const [tiposInsumo, setTiposInsumo] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'fisico', 'quimico'
  const [filtroCategoria, setFiltroCategoria] = useState(''); // ID de categoría o vacío
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tiposRes, categoriasRes] = await Promise.all([
        insumoService.getTiposInsumoConStock(),
        axios.get('http://localhost:8080/api/categorias')
      ]);
      setTiposInsumo(tiposRes.data);
      setCategorias(categoriasRes.data);
      setError('');
    } catch (err) {
      setError('Error al cargar insumos: ' + (err.response?.data || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función de filtrado combinado
  const filteredInsumos = tiposInsumo.filter((insumo) => {
    // Filtro de búsqueda por texto
    const matchSearch = 
      insumo.nombreTipoInsumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo (Físico/Químico)
    let matchTipo = true;
    if (filtroTipo === 'fisico') {
      matchTipo = !insumo.esQuimico;
    } else if (filtroTipo === 'quimico') {
      matchTipo = insumo.esQuimico;
    }
    
    // Filtro por categoría
    let matchCategoria = true;
    if (filtroCategoria) {
      matchCategoria = insumo.categoria?.idCategoria === parseInt(filtroCategoria);
    }
    
    return matchSearch && matchTipo && matchCategoria;
  });

  // Cálculos de paginación
  const totalPaginas = Math.ceil(filteredInsumos.length / itemsPorPagina);
  const indexInicio = (paginaActual - 1) * itemsPorPagina;
  const indexFin = indexInicio + itemsPorPagina;
  const insumosPaginados = filteredInsumos.slice(indexInicio, indexFin);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroTipo, filtroCategoria, itemsPorPagina]);

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroTipo('todos');
    setFiltroCategoria('');
    setPaginaActual(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando insumos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con título y botón */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestionar Insumos
          </h2>
          <button
            onClick={() => navigate('/insumos/nuevo')}
            className="flex items-center gap-2 bg-[rgb(44,171,91)] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span className="truncate">Agregar Insumo</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Sección de Filtros */}
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda por texto */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                  placeholder="Buscar por nombre o descripción..."
                />
              </div>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label htmlFor="filtroTipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                id="filtroTipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="fisico">Insumo Físico</option>
                <option value="quimico">Químico</option>
              </select>
            </div>

            {/* Filtro por Categoría */}
            <div>
              <label htmlFor="filtroCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>
                    {cat.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(searchTerm || filtroTipo !== 'todos' || filtroCategoria) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] transition-colors"
              >
                <span className="material-symbols-outlined text-base">filter_alt_off</span>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Información de resultados y selector de items por página */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span className="font-semibold">{indexInicio + 1}</span> a{' '}
            <span className="font-semibold">{Math.min(indexFin, filteredInsumos.length)}</span> de{' '}
            <span className="font-semibold">{filteredInsumos.length}</span> resultados
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="itemsPorPagina" className="text-sm text-gray-600 dark:text-gray-400">
              Mostrar:
            </label>
            <select
              id="itemsPorPagina"
              value={itemsPorPagina}
              onChange={(e) => setItemsPorPagina(Number(e.target.value))}
              className="rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-1 px-3 text-sm focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">por página</span>
          </div>
        </div>

        {/* Tabla de insumos */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3" scope="col">Nombre</th>
                <th className="px-6 py-3" scope="col">Tipo</th>
                <th className="px-6 py-3" scope="col">Descripción</th>
                <th className="px-6 py-3" scope="col">Categoría</th>
                <th className="px-6 py-3" scope="col">Stock Actual</th>
                <th className="px-6 py-3" scope="col">Stock Mínimo</th>
                <th className="px-6 py-3" scope="col">Unidad</th>
                <th className="px-6 py-3 text-center" scope="col">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {insumosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {filteredInsumos.length === 0 && tiposInsumo.length > 0
                      ? 'No se encontraron insumos con los filtros aplicados'
                      : 'No se encontraron insumos'}
                  </td>
                </tr>
              ) : (
                insumosPaginados.map((insumo) => (
                  <tr
                    key={insumo.idTipoInsumo}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {insumo.nombreTipoInsumo}
                    </td>
                    <td className="px-6 py-4">
                      {insumo.esQuimico ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          Químico
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Insumo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {insumo.descripcion}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {insumo.categoria?.nombreCategoria || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">
                      <span className={insumo.stockBajo ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                        {insumo.cantidadTotal || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {insumo.stockMinimo || '0'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {insumo.unidad?.unidad || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/insumos/${insumo.idTipoInsumo}`)}
                        className="flex items-center justify-center gap-2 w-full bg-[rgb(44,171,91)]/10 text-[rgb(44,171,91)] px-3 py-1.5 rounded-md font-medium hover:bg-[rgb(44,171,91)]/20 text-xs transition-all"
                      >
                        <span>Ver Detalles</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página <span className="font-semibold">{paginaActual}</span> de{' '}
              <span className="font-semibold">{totalPaginas}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón Primera Página */}
              <button
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                <span className="material-symbols-outlined text-base">first_page</span>
              </button>

              {/* Botón Anterior */}
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>

              {/* Números de página */}
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pageNum;
                  if (totalPaginas <= 5) {
                    pageNum = i + 1;
                  } else if (paginaActual <= 3) {
                    pageNum = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pageNum = totalPaginas - 4 + i;
                  } else {
                    pageNum = paginaActual - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPaginaActual(pageNum)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        paginaActual === pageNum
                          ? 'bg-[rgb(44,171,91)] text-white border-[rgb(44,171,91)]'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>

              {/* Botón Última Página */}
              <button
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <span className="material-symbols-outlined text-base">last_page</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ListaInsumos;
import React, { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header';
import { insumoService, categoriaService, estadoInsumoService } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reportes = () => {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filtros, setFiltros] = useState({
  idCategoria: '',
  tipoInsumo: 'todos',
  nivelStock: 'todos', // ✅ NUEVO
  busqueda: ''
  });

  // Estados de insumos para el filtro
  const [estadosInsumo, setEstadosInsumo] = useState([]);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // Tipo de vista
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla', 'graficos'

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [insumosRes, categoriasRes, estadosRes] = await Promise.all([
        insumoService.getTiposInsumoConStock(),
        categoriaService.getCategorias(),
        estadoInsumoService.getEstados()
      ]);
      setInsumos(insumosRes.data);
      setCategorias(categoriasRes.data);
      setEstadosInsumo(estadosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      idCategoria: '',
      tipoInsumo: 'todos',
      nivelStock: 'todos',
      busqueda: ''
    });
    setPaginaActual(1);
  };

  const getNivelStock = (insumo) => {
    const cantidad = parseFloat(insumo.cantidadNumerica || 0);
    if (cantidad < 10) return 'bajo';
    if (cantidad < 50) return 'medio';
    return 'normal';
  };

  // Función de filtrado
  const insumosFiltrados = insumos.filter(insumo => {
    // Filtro por búsqueda
    const matchBusqueda = !filtros.busqueda || 
      insumo.nombreTipoInsumo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      insumo.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());

    // Filtro por categoría
    const matchCategoria = !filtros.idCategoria || 
      insumo.categoria?.idCategoria === parseInt(filtros.idCategoria);

    // Filtro por tipo (Físico/Químico)
    let matchTipo = true;
    if (filtros.tipoInsumo === 'fisico') {
      matchTipo = !insumo.esQuimico;
    } else if (filtros.tipoInsumo === 'quimico') {
      matchTipo = insumo.esQuimico;
    }

    // Filtro por nivel de stock
    let matchStock = true;
    if (filtros.nivelStock && filtros.nivelStock !== 'todos') {
      const nivel = getNivelStock(insumo);
      matchStock = nivel === filtros.nivelStock;
    }

    return matchBusqueda && matchCategoria && matchTipo && matchStock;
  });

  // Paginación
  const totalPaginas = Math.ceil(insumosFiltrados.length / itemsPorPagina);
  const indexInicio = (paginaActual - 1) * itemsPorPagina;
  const indexFin = indexInicio + itemsPorPagina;
  const insumosPaginados = insumosFiltrados.slice(indexInicio, indexFin);
  const insumosStockBajo = insumos.filter(insumo => getNivelStock(insumo) === 'bajo');

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros, itemsPorPagina]);

  // Datos para gráficos
  const datosCategoria = categorias.map(cat => {
    const cantidad = insumosFiltrados.filter(
      ins => ins.categoria?.idCategoria === cat.idCategoria
    ).length;
    return {
      nombre: cat.nombreCategoria,
      cantidad
    };
  }).filter(item => item.cantidad > 0);

  const datosTipo = [
    {
      nombre: 'Insumos Físicos',
      cantidad: insumosFiltrados.filter(ins => !ins.esQuimico).length
    },
    {
      nombre: 'Químicos',
      cantidad: insumosFiltrados.filter(ins => ins.esQuimico).length
    }
  ].filter(item => item.cantidad > 0);

  // ✅ NUEVO: Datos para gráfico de Nivel de Stock
  const datosNivelStock = [
    {
      nombre: 'Stock Bajo',
      cantidad: insumos.filter(i => getNivelStock(i) === 'bajo').length,
      color: '#ef4444'
    },
    {
      nombre: 'Stock Medio',
      cantidad: insumos.filter(i => getNivelStock(i) === 'medio').length,
      color: '#f59e0b'
    },
    {
      nombre: 'Stock Normal',
      cantidad: insumos.filter(i => getNivelStock(i) === 'normal').length,
      color: '#10b981'
    }
  ].filter(item => item.cantidad > 0);

  const COLORS = ['#2cab5b', '#14378f', '#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4'];
  const COLORS_STOCK = ['#ef4444', '#f59e0b', '#10b981'];

  // Generar PDF
  const generarPDF = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-ES');

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(44, 171, 91);
    doc.text('Reporte de Inventario - Kalium', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${fechaActual}`, 14, 28);
    doc.text(`Total de ítems: ${insumosFiltrados.length}`, 14, 34);

    // Filtros aplicados
    let yPos = 42;
    doc.setFontSize(9);
    doc.setTextColor(80);
    
    const filtrosActivos = [];
    if (filtros.idCategoria) {
      const catNombre = categorias.find(c => c.idCategoria === parseInt(filtros.idCategoria))?.nombreCategoria;
      filtrosActivos.push(`Categoría: ${catNombre}`);
    }
    if (filtros.tipoInsumo !== 'todos') {
      filtrosActivos.push(`Tipo: ${filtros.tipoInsumo === 'fisico' ? 'Insumo Físico' : 'Químico'}`);
    }
    if (filtros.nivelStock !== 'todos') {
      const nivelTexto = filtros.nivelStock === 'bajo' ? 'Stock Bajo' : 
                        filtros.nivelStock === 'medio' ? 'Stock Medio' : 'Stock Normal';
      filtrosActivos.push(`Nivel: ${nivelTexto}`);
    }
    if (filtros.busqueda) {
      filtrosActivos.push(`Búsqueda: "${filtros.busqueda}"`);
    }

    if (filtrosActivos.length > 0) {
      doc.text('Filtros aplicados:', 14, yPos);
      yPos += 5;
      filtrosActivos.forEach(filtro => {
        doc.text(`• ${filtro}`, 16, yPos);
        yPos += 4;
      });
    } else {
      doc.text('Sin filtros aplicados', 14, yPos);
      yPos += 5;
    }

    // Preparar datos de la tabla
    const tableData = insumosFiltrados.map(insumo => [
      insumo.nombreTipoInsumo,
      insumo.esQuimico ? 'Químico' : 'Físico',
      insumo.categoria?.nombreCategoria || 'N/A',
      insumo.cantidadTotal || '0',
      insumo.unidad?.unidad || 'N/A'
    ]);

    // ✅ USO CORRECTO para jspdf-autotable v5
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Nombre', 'Tipo', 'Categoría', 'Cantidad', 'Unidad']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [44, 171, 91],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Nombre
        1: { cellWidth: 25, halign: 'center' }, // Tipo
        2: { cellWidth: 40 }, // Categoría
        3: { cellWidth: 25, halign: 'right' }, // Cantidad
        4: { cellWidth: 25, halign: 'center' }  // Unidad
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        // Footer en cada página
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          data.settings.margin.left,
          pageHeight - 10
        );
        
        doc.text(
          'Sistema Kalium - Gestión de Inventario',
          pageSize.width / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    // Resumen estadístico
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Verificar si hay espacio, si no, agregar página
    if (finalY > 250) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = finalY;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(44, 171, 91);
    doc.text('Resumen Estadístico', 14, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Total de tipos de insumos: ${insumosFiltrados.length}`, 14, yPos + 8);
    doc.text(`Insumos físicos: ${insumosFiltrados.filter(i => !i.esQuimico).length}`, 14, yPos + 14);
    doc.text(`Químicos: ${insumosFiltrados.filter(i => i.esQuimico).length}`, 14, yPos + 20);
    doc.text(`⚠️ Alertas de stock bajo: ${insumosStockBajo.length}`, 14, yPos + 26);
    
    // Calcular por categorías
    const categoriasConDatos = categorias.filter(cat => 
      insumosFiltrados.some(ins => ins.categoria?.idCategoria === cat.idCategoria)
    );
    
    if (categoriasConDatos.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(44, 171, 91);
      doc.text('Distribución por Categoría:', 14, yPos + 30);
      
      doc.setFontSize(9);
      doc.setTextColor(80);
      let catYPos = yPos + 37;
      
      categoriasConDatos.forEach(cat => {
        const cantidad = insumosFiltrados.filter(
          ins => ins.categoria?.idCategoria === cat.idCategoria
        ).length;
        
        doc.text(`• ${cat.nombreCategoria}: ${cantidad} tipo(s)`, 16, catYPos);
        catYPos += 5;
      });
    }

    // Guardar PDF
    doc.save(`reporte_inventario_${fechaActual.replace(/\//g, '-')}.pdf`);
  };

  // Generar Excel
  const generarExcel = () => {
    const datos = insumosFiltrados.map(insumo => ({
      'Nombre': insumo.nombreTipoInsumo,
      'Tipo': insumo.esQuimico ? 'Químico' : 'Físico',
      'Descripción': insumo.descripcion,
      'Categoría': insumo.categoria?.nombreCategoria || 'N/A',
      'Cantidad': insumo.cantidadTotal || '0',
      'Unidad': insumo.unidad?.unidad || 'N/A',
      'Nivel Stock': getNivelStock(insumo) === 'bajo' ? 'Bajo' : 
                      getNivelStock(insumo) === 'medio' ? 'Medio' : 'Normal'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 30 }, // Nombre
      { wch: 15 }, // Tipo
      { wch: 40 }, // Descripción
      { wch: 20 }, // Categoría
      { wch: 10 }, // Cantidad
      { wch: 10 }, // Unidad
      { wch: 12 }  // Nivel Stock
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, `reporte_inventario_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(44,171,91)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reportes de Inventario
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Genera informes detallados sobre el estado del inventario
          </p>
        </div>

        {insumosStockBajo.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl">warning</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                  ⚠️ {insumosStockBajo.length} Alerta(s) de Stock Bajo
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  Hay insumos con niveles críticos de inventario. Revisa la sección de alertas en la vista de gráficos.
                </p>
              </div>
              <button
                onClick={() => {
                  setFiltros(prev => ({ ...prev, nivelStock: 'bajo' }));
                  setVistaActual('tabla');
                }}
                className="text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:underline"
              >
                Ver ahora →
              </button>
            </div>
          </div>
        )}

        {/* Filtros Avanzados */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros de Búsqueda
            </h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-[rgb(44,171,91)] dark:hover:text-[rgb(44,171,91)] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda por texto */}
            <div className="lg:col-span-3">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar por nombre o descripción
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  id="busqueda"
                  name="busqueda"
                  type="text"
                  value={filtros.busqueda}
                  onChange={handleChangeFiltro}
                  placeholder="Buscar insumos..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Tipo de Insumo */}
            <div>
              <label htmlFor="tipoInsumo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                id="tipoInsumo"
                name="tipoInsumo"
                value={filtros.tipoInsumo}
                onChange={handleChangeFiltro}
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="fisico">Insumos Físicos</option>
                <option value="quimico">Químicos</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="idCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                id="idCategoria"
                name="idCategoria"
                value={filtros.idCategoria}
                onChange={handleChangeFiltro}
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

            {/* Cantidad mínima de stock */}
            <div>
              <label htmlFor="nivelStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nivel de Stock
              </label>
              <select
                id="nivelStock"
                name="nivelStock"
                value={filtros.nivelStock}
                onChange={handleChangeFiltro}
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-[rgb(44,171,91)] focus:border-transparent"
              >
                <option value="todos">Todos los niveles</option>
                <option value="bajo">⚠️ Stock Bajo (&lt; 10)</option>
                <option value="medio">⚡ Stock Medio (10-49)</option>
                <option value="normal">✓ Stock Normal (≥ 50)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex gap-4" aria-label="Tabs">
              <button
                onClick={() => setVistaActual('tabla')}
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  vistaActual === 'tabla'
                    ? 'border-[rgb(44,171,91)] text-[rgb(44,171,91)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">table_chart</span>
                  Vista de Tabla
                </span>
              </button>
              <button
                onClick={() => setVistaActual('graficos')}
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  vistaActual === 'graficos'
                    ? 'border-[rgb(44,171,91)] text-[rgb(44,171,91)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">bar_chart</span>
                  Gráficos
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Botones de Exportación */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={generarPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button
            onClick={generarExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">table_view</span>
            Exportar Excel
          </button>
        </div>

        {/* Vista de Tabla */}
        {vistaActual === 'tabla' && (
          <>
            {/* Información y selector */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-semibold">{indexInicio + 1}</span> a{' '}
                <span className="font-semibold">{Math.min(indexFin, insumosFiltrados.length)}</span> de{' '}
                <span className="font-semibold">{insumosFiltrados.length}</span> resultados
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
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Descripción</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3">Cantidad</th>
                    <th className="px-6 py-3">Unidad</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {insumosPaginados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron insumos con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    insumosPaginados.map((insumo) => (
                      <tr key={insumo.idTipoInsumo} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {insumo.nombreTipoInsumo}
                        </td>
                        <td className="px-6 py-4">
                          {insumo.esQuimico ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              Químico
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Físico
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {insumo.descripcion}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {insumo.categoria?.nombreCategoria || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                          {insumo.cantidadTotal || '0'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {insumo.unidad?.unidad || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const nivel = getNivelStock(insumo);
                            if (nivel === 'bajo') {
                              return (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1 w-fit">
                                  <span className="material-symbols-outlined text-sm">warning</span>
                                  Stock Bajo
                                </span>
                              );
                            } else if (nivel === 'medio') {
                              return (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  Stock Medio
                                </span>
                              );
                            } else {
                              return (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1 w-fit">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  Stock Normal
                                </span>
                              );
                            }
                          })()}
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
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">first_page</span>
                  </button>

                  <button
                    onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>

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

                  <button
                    onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>

                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">last_page</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Vista de Gráficos */}
        {vistaActual === 'graficos' && (
          <div className="space-y-6">
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tipos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {insumosFiltrados.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">inventory_2</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Insumos Físicos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {insumosFiltrados.filter(i => !i.esQuimico).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">science</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Químicos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {insumosFiltrados.filter(i => i.esQuimico).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">biotech</span>
                  </div>
                </div>
              </div>

              {/* ✅ MEJORADO: Tarjeta de Alertas más prominente */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-red-200 dark:border-red-800 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">warning</span>
                      Stock Bajo
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {insumosStockBajo.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Insumos críticos</p>
                  </div>
                  <div className="h-14 w-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">emergency</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de Barras - Por Categoría */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Insumos por Categoría
                </h3>
                {datosCategoria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosCategoria}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis 
                        dataKey="nombre" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="cantidad" fill="#2cab5b" name="Cantidad" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No hay datos para mostrar
                  </div>
                )}
              </div>

              {/* Gráfico de Pastel - Físicos vs Químicos */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Distribución por Tipo
                </h3>
                {datosTipo.some(d => d.cantidad > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={datosTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ nombre, cantidad, percent }) => 
                          `${nombre}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {datosTipo.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No hay datos para mostrar
                  </div>
                )}
              </div>

              {/* ✅ NUEVO: Gráfico de Pastel - Nivel de Stock */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">analytics</span>
                  Nivel de Stock
                </h3>
                {datosNivelStock.some(d => d.cantidad > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={datosNivelStock}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ nombre, cantidad, percent }) => 
                          `${nombre}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {datosNivelStock.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No hay datos para mostrar
                  </div>
                )}
              </div>
            </div>

            {/* Tabla Resumen por Categoría */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resumen por Categoría
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Total Tipos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Insumos Físicos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Químicos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        % del Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {categorias.map(cat => {
                      const insumosCat = insumosFiltrados.filter(
                        ins => ins.categoria?.idCategoria === cat.idCategoria
                      );
                      const totalCat = insumosCat.length;
                      const fisicosCat = insumosCat.filter(ins => !ins.esQuimico).length;
                      const quimicosCat = insumosCat.filter(ins => ins.esQuimico).length;
                      const porcentaje = insumosFiltrados.length > 0 
                        ? ((totalCat / insumosFiltrados.length) * 100).toFixed(1)
                        : 0;

                      if (totalCat === 0) return null;

                      return (
                        <tr key={cat.idCategoria} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {cat.nombreCategoria}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-semibold">
                            {totalCat}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                            {fisicosCat}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                            {quimicosCat}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {porcentaje}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {insumosFiltrados.length}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {insumosFiltrados.filter(i => !i.esQuimico).length}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {insumosFiltrados.filter(i => i.esQuimico).length}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        100%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Lista de Insumos con Stock Bajo (Placeholder futuro) */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Alertas de Stock Bajo ({insumosStockBajo.length})
                  </h3>
                </div>
              </div>
              <div className="p-6">
                {insumosStockBajo.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-2 text-green-400">check_circle</span>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">¡Todo en orden!</p>
                    <p className="text-sm">No hay insumos con niveles críticos de inventario</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insumosStockBajo.map(insumo => (
                      <div key={insumo.idTipoInsumo} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {insumo.nombreTipoInsumo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {insumo.categoria?.nombreCategoria || 'Sin categoría'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {insumo.cantidadTotal} {insumo.unidad?.unidad}
                          </p>
                          <span className="text-xs text-red-600 dark:text-red-400">Stock crítico</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reportes;
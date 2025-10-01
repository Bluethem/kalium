import React, { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header';
import { reporteService } from '../../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reportes = () => {
  const [filtros, setFiltros] = useState({
    tipoReporte: 'Inventario',
    fechaInicio: '',
    fechaFin: '',
    categoria: 'Todas',
  });

  const [datosReporte, setDatosReporte] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reporteGenerado, setReporteGenerado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerarReporte = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reporteService.getReporteInventario(
        filtros.fechaInicio || null,
        filtros.fechaFin || null,
        filtros.categoria
      );
      
      setDatosReporte(response.data);
      setReporteGenerado(true);
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError('Error al generar el reporte. Por favor, intenta nuevamente.');
      setDatosReporte([]);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    if (!datosReporte || datosReporte.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Reporte de Inventario', 14, 22);
      
      // Información de filtros
      doc.setFontSize(10);
      let yPos = 32;
      if (filtros.fechaInicio && filtros.fechaFin) {
        doc.text(`Periodo: ${filtros.fechaInicio} - ${filtros.fechaFin}`, 14, yPos);
        yPos += 6;
      }
      doc.text(`Categoria: ${filtros.categoria}`, 14, yPos);
      yPos += 10;
      
      // Tabla
      const tableData = datosReporte.map(item => [
        item.nombreProducto || '',
        item.categoria || '',
        item.cantidad || '',
        item.unidad || '',
        item.ultimaActualizacion || '',
        item.esQuimico ? 'Quimico' : 'Insumo'
      ]);
      
      autoTable(doc, {
        head: [['Producto', 'Categoria', 'Cantidad', 'Unidad', 'Ultima Actualizacion', 'Tipo']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [44, 171, 91] },
      });
      
      // Resumen - usar la posición final de la tabla
      const finalY = (doc.lastAutoTable?.finalY || yPos + 50) + 10;
      doc.setFontSize(12);
      doc.text('Resumen:', 14, finalY);
      doc.setFontSize(10);
      doc.text(`Total de Productos: ${datosReporte.length}`, 14, finalY + 8);
      doc.text(`Quimicos: ${datosReporte.filter(item => item.esQuimico).length}`, 14, finalY + 14);
      doc.text(`Insumos: ${datosReporte.filter(item => !item.esQuimico).length}`, 14, finalY + 20);

      // Guardar
      doc.save(`reporte_inventario_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Revisa la consola para más detalles.');
    }
  };

  const exportarExcel = () => {
    // Preparar datos
    const excelData = datosReporte.map(item => ({
      'Producto': item.nombreProducto,
      'Categoría': item.categoria,
      'Cantidad': item.cantidad,
      'Unidad': item.unidad,
      'Última Actualización': item.ultimaActualizacion,
      'Tipo': item.esQuimico ? 'Químico' : 'Insumo'
    }));
    
    // Crear hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 30 }, // Producto
      { wch: 20 }, // Categoría
      { wch: 12 }, // Cantidad
      { wch: 15 }, // Unidad
      { wch: 20 }, // Última Actualización
      { wch: 12 }, // Tipo
    ];
    ws['!cols'] = colWidths;
    
    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    
    // Agregar hoja de resumen
    const resumenData = [
      { 'Métrica': 'Total de Productos', 'Valor': datosReporte.length },
      { 'Métrica': 'Químicos', 'Valor': datosReporte.filter(item => item.esQuimico).length },
      { 'Métrica': 'Insumos', 'Valor': datosReporte.filter(item => !item.esQuimico).length },
    ];
    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    
    // Guardar
    XLSX.writeFile(wb, `reporte_inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

      // Preparar datos para gráficos
  const prepararDatosGraficos = () => {
    if (!datosReporte || datosReporte.length === 0) return { barData: [], pieData: [], categoryData: [] };
      // Datos para gráfico de barras: Productos por categoría (Químicos vs Insumos)
      const categorias = {};
      datosReporte.forEach(item => {
        const cat = item.categoria || 'Sin categoría';
        if (!categorias[cat]) {
          categorias[cat] = { nombre: cat, quimicos: 0, insumos: 0 };
        }
        if (item.esQuimico) {
          categorias[cat].quimicos++;
        } else {
          categorias[cat].insumos++;
        }
      });

      const categoryData = Object.values(categorias);

      // Datos para gráfico de pastel (distribución por tipo)
      const totalQuimicos = datosReporte.filter(item => item.esQuimico).length;
      const totalInsumos = datosReporte.filter(item => !item.esQuimico).length;
      
      const pieData = [
        { nombre: 'Químicos', valor: totalQuimicos },
        { nombre: 'Insumos', valor: totalInsumos }
      ];

      console.log('Datos del gráfico de categorías:', categoryData);
      console.log('Datos del gráfico de pastel:', pieData);

      return { categoryData, pieData };
    };

  const { categoryData, pieData } = prepararDatosGraficos();

  // Colores para los gráficos
  const COLORS = ['#2cab5b', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cantidad: <span className="font-bold">{payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Productos: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reportes</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Genera informes detallados sobre inventario, pedidos, devoluciones e incidentes.
            </p>
          </div>

          {/* Formulario de filtros */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="tipoReporte" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Tipo de Reporte
                </label>
                <select
                  id="tipoReporte"
                  name="tipoReporte"
                  value={filtros.tipoReporte}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[#2cab5b] transition-all text-gray-900 dark:text-white"
                >
                  <option>Inventario</option>
                  <option>Pedidos</option>
                  <option>Devoluciones</option>
                  <option>Incidentes</option>
                </select>
              </div>

              <div>
                <label htmlFor="fechaInicio" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[#2cab5b] transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="fechaFin" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  id="fechaFin"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[#2cab5b] transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="categoria" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Categoría
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={filtros.categoria}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[#2cab5b] transition-all text-gray-900 dark:text-white"
                >
                  <option>Todas</option>
                  <option>Químicos</option>
                  <option>Insumo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleGenerarReporte}
                disabled={loading}
                className="bg-[#2cab5b] text-white font-semibold rounded-md h-12 px-6 hover:bg-[#2cab5b]/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">description</span>
                    <span>Generar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Contenido del reporte */}
          {reporteGenerado && !loading && (
            <div className="mt-10 space-y-8">
              {/* Header con botones de exportación */}
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Reporte de Inventario
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={exportarPDF}
                    className="bg-red-600 text-white font-semibold rounded-md h-10 px-4 hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={exportarExcel}
                    className="bg-green-600 text-white font-semibold rounded-md h-10 px-4 hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">table_chart</span>
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {datosReporte.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
                    inventory_2
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    No se encontraron datos para los filtros seleccionados
                  </p>
                </div>
              ) : (
                <>
                  {/* Resumen con tarjetas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total de Productos</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {datosReporte.length}
                          </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3">
                          <span className="material-symbols-outlined text-3xl text-gray-600 dark:text-gray-400">
                            inventory
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Químicos</p>
                          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                            {datosReporte.filter(item => item.esQuimico).length}
                          </p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                          <span className="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">
                            science
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Insumos</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                            {datosReporte.filter(item => !item.esQuimico).length}
                          </p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                          <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
                            category
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráficos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Barras Agrupadas */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Productos por Categoría
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis 
                            dataKey="nombre" 
                            angle={-45} 
                            textAnchor="end" 
                            height={100}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: '#6b7280' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="quimicos" fill="#8b5cf6" name="Químicos" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="insumos" fill="#3b82f6" name="Insumos" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Pastel */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Distribución: Químicos vs Insumos
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ nombre, percent, valor }) => `${nombre}: ${valor} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="valor"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.nombre === 'Químicos' ? '#8b5cf6' : '#3b82f6'} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tabla de datos */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          <tr>
                            <th scope="col" className="px-6 py-4 font-medium">Producto</th>
                            <th scope="col" className="px-6 py-4 font-medium">Categoría</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">Cantidad</th>
                            <th scope="col" className="px-6 py-4 font-medium">Unidad</th>
                            <th scope="col" className="px-6 py-4 font-medium">Última Actualización</th>
                            <th scope="col" className="px-6 py-4 font-medium text-center">Tipo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {datosReporte.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                {item.nombreProducto}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                {item.categoria}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-right font-mono">
                                {item.cantidad}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                {item.unidad}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                {item.ultimaActualizacion}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.esQuimico 
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                  {item.esQuimico ? 'Químico' : 'Insumo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reportes;
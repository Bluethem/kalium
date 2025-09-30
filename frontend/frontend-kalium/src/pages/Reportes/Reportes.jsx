import React, { useState } from 'react';
import Header from '../../components/Layout/Header';

const Reportes = () => {
  const [filtros, setFiltros] = useState({
    tipoReporte: 'Inventario',
    fechaInicio: '',
    fechaFin: '',
    categoria: 'Todas',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerarReporte = () => {
    console.log('Generando reporte con filtros:', filtros);
    alert('Funcionalidad de generación de reportes en desarrollo');
  };

  // Datos de ejemplo
  const datosReporte = [
    {
      producto: 'Reactivo A',
      categoria: 'Químicos',
      cantidad: 150,
      ubicacion: 'Almacén 1',
      ultimaActualizacion: '20/05/2024',
    },
    {
      producto: 'Reactivo B',
      categoria: 'Químicos',
      cantidad: 200,
      ubicacion: 'Almacén 2',
      ultimaActualizacion: '22/05/2024',
    },
    {
      producto: 'Material de Vidrio 1',
      categoria: 'Vidriería',
      cantidad: 500,
      ubicacion: 'Almacén 1',
      ultimaActualizacion: '25/05/2024',
    },
    {
      producto: 'Material de Vidrio 2',
      categoria: 'Vidriería',
      cantidad: 300,
      ubicacion: 'Almacén 2',
      ultimaActualizacion: '28/05/2024',
    },
    {
      producto: 'Cultivos Celulares',
      categoria: 'Biológicos',
      cantidad: 100,
      ubicacion: 'Refrigerador 1',
      ultimaActualizacion: '30/05/2024',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reportes</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Genera informes detallados sobre inventario, pedidos, devoluciones e incidentes.
            </p>
          </div>

          {/* Formulario de filtros */}
          <div className="bg-[#f6f6f8] dark:bg-[#111621] border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-6">
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
                  className="w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[rgb(44,171,91)] transition-all text-gray-900 dark:text-white"
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
                  className="w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[#2cab5b] transition-all text-gray-900 dark:text-white"
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
                  className="w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[rgb(44,171,91)] transition-all text-gray-900 dark:text-white"
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
                  className="w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800 rounded-md h-12 px-4 focus:ring-2 focus:ring-[#2cab5b]/50 focus:border-[#2cab5b] transition-all text-gray-900 dark:text-white"
                >
                  <option>Todas</option>
                  <option>Químicos</option>
                  <option>Vidriería</option>
                  <option>Biológicos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleGenerarReporte}
                className="bg-[#2cab5b] text-white font-semibold rounded-md h-12 px-6 hover:bg-[#2cab5b]/90 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">description</span>
                <span>Generar Reporte</span>
              </button>
            </div>
          </div>

          {/* Tabla de reporte */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              Reporte de Inventario
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-[#f6f6f8] dark:bg-[#111621]">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Producto</th>
                    <th scope="col" className="px-6 py-4 font-medium">Categoría</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right">Cantidad</th>
                    <th scope="col" className="px-6 py-4 font-medium">Ubicación</th>
                    <th scope="col" className="px-6 py-4 font-medium">Última Actualización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {datosReporte.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {item.producto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {item.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-right">
                        {item.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {item.ubicacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {item.ultimaActualizacion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reportes;
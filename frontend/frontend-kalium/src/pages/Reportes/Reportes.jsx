import React, { useState, useEffect } from 'react';
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
  nivelStock: 'todos', // 
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

  // NUEVO: Datos para gráfico de Nivel de Stock
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
  const generarPDFMejorado = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-ES');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Obtener datos del usuario desde localStorage
    let nombreUsuario = 'Usuario';
    try {
      const usuarioStorage = localStorage.getItem('usuario');
      if (usuarioStorage) {
        const usuario = JSON.parse(usuarioStorage);
        nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
    
    // ============ HEADER PROFESIONAL CON LOGO CORREGIDO ============
    const agregarHeader = () => {
      // Fondo del header
      doc.setFillColor(44, 171, 91);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo con proporciones correctas (cuadrado)
      try {
        const logoImg = new Image();
        logoImg.src = '/logo_nuevo.png';
        // Cambio: ahora es cuadrado 20x20 para mantener proporción
        doc.addImage(logoImg, 'PNG', 10, 7, 16, 22);
      } catch (error) {
        console.log('Logo no disponible');
      }
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('KALIUM', 40, 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión de Inventario', 40, 22);
      
      // Info de fecha en el header
      doc.setFontSize(9);
      doc.text(`Generado: ${fechaActual}`, pageWidth - 55, 15);
      doc.text(`Usuario: ${nombreUsuario}`, pageWidth - 55, 21);
    };
    
    agregarHeader();
    
    // ============ TÍTULO DEL REPORTE ============
    let yPos = 45;
    doc.setFontSize(16);
    doc.setTextColor(44, 171, 91);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Inventario', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de registros: ${insumosFiltrados.length}`, 14, yPos);
    
    // ============ FILTROS APLICADOS ============
    yPos += 8;
    const filtrosActivos = [];
    
    if (filtros.idCategoria) {
      const catNombre = categorias.find(c => c.idCategoria === parseInt(filtros.idCategoria))?.nombreCategoria;
      filtrosActivos.push(`Categoria: ${catNombre}`);
    }
    if (filtros.tipoInsumo !== 'todos') {
      filtrosActivos.push(`Tipo: ${filtros.tipoInsumo === 'fisico' ? 'Insumo Fisico' : 'Quimico'}`);
    }
    if (filtros.nivelStock !== 'todos') {
      const nivelTexto = filtros.nivelStock === 'bajo' ? 'Stock Bajo' : 
                        filtros.nivelStock === 'medio' ? 'Stock Medio' : 'Stock Normal';
      filtrosActivos.push(`Nivel: ${nivelTexto}`);
    }
    if (filtros.busqueda) {
      filtrosActivos.push(`Busqueda: "${filtros.busqueda}"`);
    }

    if (filtrosActivos.length > 0) {
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(12, yPos - 2, pageWidth - 24, filtrosActivos.length * 5 + 8, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros aplicados:', 14, yPos + 3);
      
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      filtrosActivos.forEach(filtro => {
        doc.text(`• ${filtro}`, 16, yPos);
        yPos += 5;
      });
      yPos += 3;
    } else {
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(12, yPos - 2, pageWidth - 24, 10, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Sin filtros aplicados - Mostrando todo el inventario', 14, yPos + 3);
      yPos += 10;
    }

    // ============ ALERTAS DE STOCK BAJO (SIN EMOJIS) ============
    if (insumosStockBajo.length > 0) {
      yPos += 5;
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(12, yPos - 2, pageWidth - 24, 12, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(146, 64, 14);
      doc.setFont('helvetica', 'bold');
      // CAMBIO: Sin emoji, usando símbolo de texto
      doc.text(`ALERTA: ${insumosStockBajo.length} insumo(s) con stock critico`, 14, yPos + 3);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Revise la seccion de resumen para mas detalles', 14, yPos + 8);
      yPos += 14;
    }

    // ============ TABLA CON INDICADORES DE TEXTO (SIN EMOJIS) ============
    yPos += 5;
    const tableData = insumosFiltrados.map(insumo => {
      const nivelStock = getNivelStock(insumo);
      // CAMBIO: Indicadores de texto en lugar de emojis
      const stockIndicador = nivelStock === 'bajo' ? 'Bajo' : 
                            nivelStock === 'medio' ? 'Medio' : 
                            'Normal';
      
      return [
        insumo.nombreTipoInsumo,
        insumo.esQuimico ? 'Quimico' : 'Fisico',
        insumo.categoria?.nombreCategoria || 'N/A',
        `${insumo.cantidadTotal || '0'} ${insumo.unidad?.unidad || ''}`,
        stockIndicador
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Nombre del Insumo', 'Tipo', 'Categoria', 'Cantidad', 'Estado Stock']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [44, 171, 91],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 65, fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'center' }
      },
      margin: { left: 14, right: 14 },
      // Colorear filas según nivel de stock
      didParseCell: function(data) {
        if (data.column.index === 4 && data.section === 'body') {
          const cellText = data.cell.text[0];
          if (cellText.includes('Bajo')) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText.includes('Medio')) {
            data.cell.styles.textColor = [245, 158, 11];
          } else {
            data.cell.styles.textColor = [34, 197, 94];
          }
        }
      },
      didDrawPage: function(data) {
        // Footer en cada página
        const pageCount = doc.internal.getNumberOfPages();
        
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Pagina ${data.pageNumber} de ${pageCount}`,
          14,
          pageHeight - 10
        );
        
        doc.text(
          'Sistema Kalium - Confidencial',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        doc.text(
          `Generado: ${fechaActual}`,
          pageWidth - 14,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });

    // ============ RESUMEN ESTADÍSTICO (SIN EMOJIS) ============
    const finalY = doc.lastAutoTable.finalY + 15;
    
    if (finalY > pageHeight - 80) {
      doc.addPage();
      agregarHeader();
      yPos = 45;
    } else {
      yPos = finalY;
    }
    
    // Box para resumen
    doc.setFillColor(240, 249, 243);
    doc.roundedRect(12, yPos - 5, pageWidth - 24, 70, 3, 3, 'F');
    doc.setDrawColor(44, 171, 91);
    doc.setLineWidth(0.5);
    doc.roundedRect(12, yPos - 5, pageWidth - 24, 70, 3, 3, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(44, 171, 91);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Estadistico', 16, yPos + 2);
    
    // Estadísticas en dos columnas
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'normal');
    
    const col1X = 20;
    const col2X = pageWidth / 2 + 10;
    let statsY = yPos + 12;
    
    // Columna 1
    doc.setFont('helvetica', 'bold');
    doc.text('General:', col1X, statsY);
    doc.setFont('helvetica', 'normal');
    statsY += 6;
    doc.text(`• Total tipos de insumos: ${insumosFiltrados.length}`, col1X + 2, statsY);
    statsY += 5;
    doc.text(`• Insumos fisicos: ${insumosFiltrados.filter(i => !i.esQuimico).length}`, col1X + 2, statsY);
    statsY += 5;
    doc.text(`• Quimicos: ${insumosFiltrados.filter(i => i.esQuimico).length}`, col1X + 2, statsY);
    
    // Columna 2 - Niveles de Stock (SIN EMOJIS)
    statsY = yPos + 12;
    doc.setFont('helvetica', 'bold');
    doc.text('Niveles de Stock:', col2X, statsY);
    doc.setFont('helvetica', 'normal');
    statsY += 6;
    
    const stockBajo = insumos.filter(i => getNivelStock(i) === 'bajo').length;
    const stockMedio = insumos.filter(i => getNivelStock(i) === 'medio').length;
    const stockNormal = insumos.filter(i => getNivelStock(i) === 'normal').length;
    
    doc.setTextColor(220, 38, 38);
    doc.text(`Stock Bajo: ${stockBajo}`, col2X + 2, statsY);
    statsY += 5;
    doc.setTextColor(245, 158, 11);
    doc.text(`Stock Medio: ${stockMedio}`, col2X + 2, statsY);
    statsY += 5;
    doc.setTextColor(34, 197, 94);
    doc.text(`Stock Normal: ${stockNormal}`, col2X + 2, statsY);
    
    // Distribución por Categoría
    statsY += 10;
    doc.setTextColor(60);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribucion por Categoria:', col1X, statsY);
    doc.setFont('helvetica', 'normal');
    
    const categoriasConDatos = categorias.filter(cat => 
      insumosFiltrados.some(ins => ins.categoria?.idCategoria === cat.idCategoria)
    );
    
    if (categoriasConDatos.length > 0) {
      statsY += 6;
      categoriasConDatos.slice(0, 4).forEach(cat => {
        const cantidad = insumosFiltrados.filter(
          ins => ins.categoria?.idCategoria === cat.idCategoria
        ).length;
        
        const porcentaje = ((cantidad / insumosFiltrados.length) * 100).toFixed(1);
        doc.text(`• ${cat.nombreCategoria}: ${cantidad} (${porcentaje}%)`, col1X + 2, statsY);
        statsY += 5;
      });
    }

    // ============ PÁGINA DE ALERTAS (SIN EMOJIS) ============
    if (insumosStockBajo.length > 0) {
      doc.addPage();
      agregarHeader();
      
      yPos = 45;
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text('Insumos con Stock Critico', 14, yPos);
      
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('Los siguientes insumos requieren atencion inmediata:', 14, yPos);
      
      yPos += 8;
      const alertasData = insumosStockBajo.map(ins => [
        ins.nombreTipoInsumo,
        ins.categoria?.nombreCategoria || 'N/A',
        `${ins.cantidadTotal} ${ins.unidad?.unidad}`,
        'Critico'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Insumo', 'Categoria', 'Cantidad Actual', 'Estado']],
        body: alertasData,
        theme: 'striped',
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [220, 38, 38]
        }
      });
    }

    // Guardar PDF
    const nombreArchivo = `Reporte_Kalium_${fechaActual.replace(/\//g, '-')}_${Date.now()}.pdf`;
    doc.save(nombreArchivo);
  };

  // Generar Excel
  // Función mejorada para generar Excel con múltiples hojas y estilos
  const generarExcelMejorado = () => {
    const wb = XLSX.utils.book_new();
    const fechaActual = new Date().toLocaleDateString('es-ES');

    // ============ HOJA 1: INVENTARIO COMPLETO ============
    const datosInventario = insumosFiltrados.map(insumo => ({
      'ID': insumo.idTipoInsumo,
      'Nombre': insumo.nombreTipoInsumo,
      'Tipo': insumo.esQuimico ? 'Químico' : 'Físico',
      'Descripción': insumo.descripcion || '',
      'Categoría': insumo.categoria?.nombreCategoria || 'Sin categoría',
      'Cantidad': insumo.cantidadTotal || 0,
      'Unidad': insumo.unidad?.unidad || '',
      'Nivel Stock': getNivelStock(insumo) === 'bajo' ? 'Bajo' : 
                    getNivelStock(insumo) === 'medio' ? 'Medio' : 'Normal',
      'Estado': getNivelStock(insumo) === 'bajo' ? 'CRÍTICO' : 'OK'
    }));

    const wsInventario = XLSX.utils.json_to_sheet(datosInventario);

    // Ajustar ancho de columnas
    wsInventario['!cols'] = [
      { wch: 8 },   // ID
      { wch: 35 },  // Nombre
      { wch: 15 },  // Tipo
      { wch: 45 },  // Descripción
      { wch: 20 },  // Categoría
      { wch: 12 },  // Cantidad
      { wch: 10 },  // Unidad
      { wch: 15 },  // Nivel Stock
      { wch: 12 }   // Estado
    ];

    XLSX.utils.book_append_sheet(wb, wsInventario, 'Inventario Completo');

    // ============ HOJA 2: RESUMEN ESTADÍSTICO ============
    const resumenData = [
      { Métrica: 'Total de Tipos de Insumos', Valor: insumosFiltrados.length },
      { Métrica: 'Insumos Físicos', Valor: insumosFiltrados.filter(i => !i.esQuimico).length },
      { Métrica: 'Químicos', Valor: insumosFiltrados.filter(i => i.esQuimico).length },
      { Métrica: '', Valor: '' },
      { Métrica: 'NIVELES DE STOCK', Valor: '' },
      { Métrica: 'Stock Bajo (Crítico)', Valor: insumos.filter(i => getNivelStock(i) === 'bajo').length },
      { Métrica: 'Stock Medio', Valor: insumos.filter(i => getNivelStock(i) === 'medio').length },
      { Métrica: 'Stock Normal', Valor: insumos.filter(i => getNivelStock(i) === 'normal').length },
      { Métrica: '', Valor: '' },
      { Métrica: 'Fecha de generación', Valor: fechaActual },
      { Métrica: 'Generado por', Valor: 'Sistema Kalium' }
    ];

    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // ============ HOJA 3: ALERTAS DE STOCK BAJO ============
    if (insumosStockBajo.length > 0) {
      const datosAlertas = insumosStockBajo.map(insumo => ({
        'Estado': 'CRÍTICO',
        'Nombre del Insumo': insumo.nombreTipoInsumo,
        'Categoría': insumo.categoria?.nombreCategoria || 'Sin categoría',
        'Cantidad Actual': insumo.cantidadTotal || 0,
        'Unidad': insumo.unidad?.unidad || '',
        'Acción Requerida': 'Revisar y reponer'
      }));

      const wsAlertas = XLSX.utils.json_to_sheet(datosAlertas);
      wsAlertas['!cols'] = [
        { wch: 12 },  // Estado
        { wch: 35 },  // Nombre
        { wch: 20 },  // Categoría
        { wch: 15 },  // Cantidad
        { wch: 10 },  // Unidad
        { wch: 25 }   // Acción
      ];
      XLSX.utils.book_append_sheet(wb, wsAlertas, 'Alertas Stock Bajo');
    }

    // ============ HOJA 4: POR CATEGORÍA ============
    const categoriaStats = categorias
      .map(cat => {
        const insumosCategoria = insumosFiltrados.filter(
          ins => ins.categoria?.idCategoria === cat.idCategoria
        );
        
        if (insumosCategoria.length === 0) return null;
        
        return {
          'Categoría': cat.nombreCategoria,
          'Total Insumos': insumosCategoria.length,
          'Físicos': insumosCategoria.filter(i => !i.esQuimico).length,
          'Químicos': insumosCategoria.filter(i => i.esQuimico).length,
          'Stock Bajo': insumosCategoria.filter(i => getNivelStock(i) === 'bajo').length,
          'Stock Medio': insumosCategoria.filter(i => getNivelStock(i) === 'medio').length,
          'Stock Normal': insumosCategoria.filter(i => getNivelStock(i) === 'normal').length,
          '% del Total': ((insumosCategoria.length / insumosFiltrados.length) * 100).toFixed(1) + '%'
        };
      })
      .filter(item => item !== null);

    const wsCategorias = XLSX.utils.json_to_sheet(categoriaStats);
    wsCategorias['!cols'] = [
      { wch: 25 },  // Categoría
      { wch: 15 },  // Total
      { wch: 12 },  // Físicos
      { wch: 12 },  // Químicos
      { wch: 12 },  // Bajo
      { wch: 12 },  // Medio
      { wch: 12 },  // Normal
      { wch: 12 }   // Porcentaje
    ];
    XLSX.utils.book_append_sheet(wb, wsCategorias, 'Por Categoría');

    // ============ HOJA 5: DETALLE DE QUÍMICOS ============
    const quimicos = insumosFiltrados.filter(i => i.esQuimico);
    if (quimicos.length > 0) {
      const datosQuimicos = quimicos.map(q => ({
        'Nombre': q.nombreTipoInsumo,
        'Descripción': q.descripcion || '',
        'Categoría': q.categoria?.nombreCategoria || '',
        'Cantidad': q.cantidadTotal || 0,
        'Unidad': q.unidad?.unidad || '',
        'Nivel': getNivelStock(q)
      }));

      const wsQuimicos = XLSX.utils.json_to_sheet(datosQuimicos);
      wsQuimicos['!cols'] = [
        { wch: 35 },  // Nombre
        { wch: 40 },  // Descripción
        { wch: 20 },  // Categoría
        { wch: 12 },  // Cantidad
        { wch: 10 },  // Unidad
        { wch: 12 }   // Nivel
      ];
      XLSX.utils.book_append_sheet(wb, wsQuimicos, 'Químicos');
    }

    // ============ HOJA 6: DETALLE DE INSUMOS FÍSICOS ============
    const fisicos = insumosFiltrados.filter(i => !i.esQuimico);
    if (fisicos.length > 0) {
      const datosFisicos = fisicos.map(f => ({
        'Nombre': f.nombreTipoInsumo,
        'Descripción': f.descripcion || '',
        'Categoría': f.categoria?.nombreCategoria || '',
        'Cantidad': f.cantidadTotal || 0,
        'Unidad': f.unidad?.unidad || '',
        'Nivel': getNivelStock(f)
      }));

      const wsFisicos = XLSX.utils.json_to_sheet(datosFisicos);
      wsFisicos['!cols'] = [
        { wch: 35 },  // Nombre
        { wch: 40 },  // Descripción
        { wch: 20 },  // Categoría
        { wch: 12 },  // Cantidad
        { wch: 10 },  // Unidad
        { wch: 12 }   // Nivel
      ];
      XLSX.utils.book_append_sheet(wb, wsFisicos, 'Insumos Físicos');
    }

    // Guardar archivo
    const nombreArchivo = `Reporte_Kalium_${fechaActual.replace(/\//g, '-')}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
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
    <div className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  {insumosStockBajo.length} Alerta(s) de Stock Bajo
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
            onClick={generarPDFMejorado}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button
            onClick={generarExcelMejorado}
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

              {/* MEJORADO: Tarjeta de Alertas más prominente */}
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

              {/* NUEVO: Gráfico de Pastel - Nivel de Stock */}
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
      </div>
    </div>
  );
};

export default Reportes;
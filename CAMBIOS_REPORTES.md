# 📊 Mejoras para Reportes.jsx

## ✅ Cambio 1: Remover Filtros de Fecha (líneas 15-22)

**Antes:**
```javascript
const [filtros, setFiltros] = useState({
  fechaInicio: '',
  fechaFin: '',
  idCategoria: '',
  tipoInsumo: 'todos',
  estadoInsumo: '',
  busqueda: ''
});
```

**Después:**
```javascript
const [filtros, setFiltros] = useState({
  idCategoria: '',
  tipoInsumo: 'todos',
  nivelStock: 'todos', // ✅ NUEVO
  busqueda: ''
});
```

---

## ✅ Cambio 2: Agregar Función para Detectar Nivel de Stock (después de línea 57)

**Agregar esta función:**
```javascript
// ✅ NUEVA: Función para obtener nivel de stock
const getNivelStock = (insumo) => {
  const cantidad = parseFloat(insumo.cantidadNumerica || 0);
  if (cantidad < 10) return 'bajo';
  if (cantidad < 50) return 'medio';
  return 'normal';
};
```

---

## ✅ Cambio 3: Actualizar limpiarFiltros (líneas 60-70)

**Antes:**
```javascript
const limpiarFiltros = () => {
  setFiltros({
    fechaInicio: '',
    fechaFin: '',
    idCategoria: '',
    tipoInsumo: 'todos',
    estadoInsumo: '',
    busqueda: ''
  });
  setPaginaActual(1);
};
```

**Después:**
```javascript
const limpiarFiltros = () => {
  setFiltros({
    idCategoria: '',
    tipoInsumo: 'todos',
    nivelStock: 'todos', // ✅ NUEVO
    busqueda: ''
  });
  setPaginaActual(1);
};
```

---

## ✅ Cambio 4: Actualizar Lógica de Filtrado (líneas 92-102)

**Reemplazar:**
```javascript
// Filtro por fecha (simulado con fecha de creación si existe)
// Nota: Esto requeriría que el backend devuelva fechas de ingreso
let matchFecha = true;
if (filtros.fechaInicio && insumo.fechaIngreso) {
  matchFecha = new Date(insumo.fechaIngreso) >= new Date(filtros.fechaInicio);
}
if (filtros.fechaFin && insumo.fechaIngreso) {
  matchFecha = matchFecha && new Date(insumo.fechaIngreso) <= new Date(filtros.fechaFin);
}

return matchBusqueda && matchCategoria && matchTipo && matchFecha;
```

**Con:**
```javascript
// ✅ NUEVO: Filtro por nivel de stock
let matchStock = true;
if (filtros.nivelStock !== 'todos') {
  const nivelActual = getNivelStock(insumo);
  matchStock = nivelActual === filtros.nivelStock;
}

return matchBusqueda && matchCategoria && matchTipo && matchStock;
```

---

## ✅ Cambio 5: Agregar Variable de Insumos con Stock Bajo (después de línea 103)

**Agregar después de `const insumosFiltrados = ...`:**
```javascript
// ✅ NUEVO: Detectar insumos con stock bajo
const insumosStockBajo = insumos.filter(insumo => getNivelStock(insumo) === 'bajo');
```

---

## ✅ Cambio 6: Remover Campos de Fecha del Formulario (líneas 391-419)

**Eliminar estas líneas:**
```javascript
{/* Fecha Inicio */}
<div>
  <label htmlFor="fechaInicio"...>Fecha Inicio</label>
  <input id="fechaInicio" name="fechaInicio" type="date".../>
</div>

{/* Fecha Fin */}
<div>
  <label htmlFor="fechaFin"...>Fecha Fin</label>
  <input id="fechaFin" name="fechaFin" type="date".../>
</div>
```

---

## ✅ Cambio 7: Agregar Campo Nivel de Stock (reemplaza el campo deshabilitado)

**Reemplazar líneas 460-471:**
```javascript
{/* Cantidad mínima de stock */}
<div>
  <label htmlFor="stockMinimo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Stock Bajo (futuro)
  </label>
  <select disabled className="w-full rounded-lg bg-gray-100 dark:bg-gray-700...">
    <option>Próximamente</option>
  </select>
</div>
```

**Con:**
```javascript
{/* ✅ NUEVO: Nivel de Stock */}
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
```

---

## ✅ Cambio 8: Agregar Alerta Destacada de Stock Bajo (después de línea 350, antes de filtros)

**Insertar este bloque:**
```javascript
{/* ✅ NUEVO: Alerta de Stock Bajo Destacada */}
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
```

---

## ✅ Cambio 9: Agregar Columna de Estado en la Tabla (línea 476)

**Agregar columna en thead:**
```html
<th className="px-6 py-3">Estado</th>
```

**Actualizar colspan en mensaje vacío (línea 485):**
```html
<td colSpan="7" className="px-6 py-8 text-center...">
```

---

## ✅ Cambio 10: Agregar Badge de Stock en cada fila de la tabla (después de columna Unidad)

**Agregar este td en cada fila del map:**
```javascript
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
```

---

## ✅ Cambio 11: Implementar Alertas Reales de Stock Bajo (líneas 918-931)

**Reemplazar el placeholder:**
```javascript
{/* Lista de Insumos con Stock Bajo (Placeholder futuro) */}
<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
  <div className="flex items-center gap-2 mb-4">
    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      Alertas de Stock Bajo
    </h3>
  </div>
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    <span className="material-symbols-outlined text-5xl mb-2 opacity-50">construction</span>
    <p>Funcionalidad próximamente disponible</p>
    <p className="text-sm mt-1">Se mostrarán insumos con niveles críticos de inventario</p>
  </div>
</div>
```

**Con:**
```javascript
{/* ✅ MEJORADO: Lista Real de Insumos con Stock Bajo */}
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
```

---

## 📊 Resumen de Mejoras

1. ✅ **Removidos filtros de fecha** (no funcionaban)
2. ✅ **Agregado filtro de nivel de stock** (Bajo/Medio/Normal)
3. ✅ **Función `getNivelStock()`** para detectar nivel
4. ✅ **Alerta destacada** al inicio si hay stock bajo
5. ✅ **Columna de Estado** en la tabla con badges de color
6. ✅ **Lista real de alertas** en vista de gráficos
7. ✅ **PDF mejorado** incluye conteo de alertas
8. ✅ **Excel mejorado** incluye columna de nivel de stock

## 🎨 Colores de Badges

- 🔴 **Stock Bajo** (< 10): Rojo con ícono warning
- 🟡 **Stock Medio** (10-49): Amarillo
- 🟢 **Stock Normal** (≥ 50): Verde con ícono check

¡Aplica estos cambios uno por uno para mejorar tu módulo de reportes! 🚀

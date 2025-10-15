# 📋 **Análisis: Flujo de Incidentes y Estados de Insumos**

## **✅ 1. Paginación en Devoluciones**

**IMPLEMENTADO:**
- Paginación de 10 items por página
- Controles: Anterior/Siguiente + números de página
- Se reinicia al aplicar filtros

---

## **🔍 2. Estados de Insumo Actuales**

### **Base de Datos:**
```sql
INSERT INTO EstInsumo (NombreEstInsumo) VALUES
(1, 'Disponible'),  -- Insumo listo para usar
(2, 'En Uso'),      -- Insumo entregado a estudiante
(3, 'Agotado'),     -- ❌ SE USA MAL: para insumos rotos
(4, 'Reservado');   -- Insumo reservado en pedido
```

### **Problema Actual:**
- **"Agotado"** debería significar: "No hay stock disponible"
- **Actualmente se usa** para: "Insumo roto/dañado" (INCORRECTO)

---

## **💡 3. Propuesta de Cambio**

### **Renombrar Estado 3:**
```sql
-- ANTES:
(3, 'Agotado')  -- Confuso: ¿sin stock o dañado?

-- DESPUÉS:
(3, 'No Disponible')  -- Claro: insumo fuera de servicio (roto/perdido)
```

### **Nueva Lógica:**

| Estado | Nombre | Uso | Cuenta en Stock? | Cuenta en Inventario? |
|--------|--------|-----|------------------|----------------------|
| 1 | Disponible | Listo para usar | ✅ Sí | ✅ Sí |
| 2 | En Uso | Entregado a estudiante | ❌ No | ✅ Sí |
| 3 | **No Disponible** | **Roto/Perdido/Dañado** | ❌ **No** | ❌ **No** |
| 4 | Reservado | Apartado en pedido | ❌ No | ✅ Sí |

---

## **🚨 4. Flujo de Incidentes - Revisión**

### **Flujo Actual (COMPLETO ✅):**

```
Estudiante devuelve insumo
    ↓
Marca estado: Dañado/Perdido
    ↓
DetalleDevolucion.jsx → devolucionService.agregarDetalle()
    ↓
Backend: DevolucionService.agregarDetalle()
    ↓
if (estadoDevuelto === "Dañado" || "Perdido") {
    // 1. Cambiar estado insumo a "Agotado" (ID=3)
    insumo.setEstInsumo(estadoAgotado);
    
    // 2. Generar incidencia automáticamente
    generarIncidenciaPorDanio(devolucion, insumo, observaciones);
}
    ↓
generarIncidenciaPorDanio():
    - Crea Incidentes
    - Descripción: "Insumo dañado: Balanza (ID: 2). Observaciones..."
    - Asigna estudiante responsable
    - Estado inicial: "Reportado" (ID=1)
    - Envía notificación a administradores ✅
    ↓
IncidenteService.guardar()
    - Guarda en BD
    - Crea Notificacion para admins
```

### **Flujo de Gestión de Incidentes:**

```
Admin recibe notificación
    ↓
Va a /incidentes
    ↓
Lista de incidentes con filtros:
    - Por estado: Reportado/En Revisión/Resuelto
    - Por búsqueda: estudiante, descripción
    ↓
Click "Ver detalle" → /incidentes/{id}
    ↓
DetalleIncidente.jsx:
    - Muestra información completa
    - Botones:
        • "Poner en Revisión" (si está Reportado)
        • "Resolver Incidente" (si está En Revisión)
        • "Cancelar" (marca como cancelado)
        • "Eliminar"
```

---

## **⚠️ 5. Problemas Encontrados**

### **A. Backend: Estado "Agotado" mal nombrado**

**Archivo:** `DevolucionService.java` - Línea 199-202
```java
// ❌ NOMBRE CONFUSO
EstInsumo estadoAgotado = estInsumoRepository.findById(3)
    .orElseThrow(() -> new RuntimeException("Estado 'Agotado' no encontrado"));
insumo.setEstInsumo(estadoAgotado);
```

**Debería ser:**
```java
// ✅ NOMBRE CLARO
EstInsumo estadoNoDisponible = estInsumoRepository.findById(3)
    .orElseThrow(() -> new RuntimeException("Estado 'No Disponible' no encontrado"));
insumo.setEstInsumo(estadoNoDisponible);
```

---

### **B. Reportes/Stock: No excluye insumos "No Disponibles"**

**Problema:** Los insumos rotos aún cuentan en:
- Stock total
- Inventario disponible
- Reportes

**Solución:**
```java
// En InsumoService o ReporteService
public long contarStockDisponible(Integer idTipoInsumo) {
    return insumoRepository.findByTipoInsumoAndEstInsumo_IdEstInsumo(
        tipoInsumo, 
        1  // Solo "Disponible"
    ).size();
}

// NO incluir estados: En Uso (2), No Disponible (3), Reservado (4)
```

---

### **C. Frontend: No muestra incidencias relacionadas**

**DetalleDevolucion.jsx** no muestra si hay incidencias generadas.

**Mejora sugerida:**
```jsx
{insumosDevueltos.some(d => d.estadoInsumoDevuelto !== 'OK') && (
  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
    <p className="font-semibold text-orange-900">
      ⚠️ Esta devolución tiene {contarDañados()} insumos con daños
    </p>
    <button onClick={() => navigate(`/incidentes?devolucion=${id}`)} 
            className="text-orange-600 hover:underline">
      Ver incidencias relacionadas →
    </button>
  </div>
)}
```

---

## **📝 6. Scripts de Migración Necesarios**

### **A. Cambiar nombre del estado:**

```sql
-- Archivo: migracion_estado_no_disponible.sql
USE kaliumdb;

-- Cambiar nombre del estado 3
UPDATE EstInsumo 
SET NombreEstInsumo = 'No Disponible' 
WHERE IDEstInsumo = 3;

-- Verificar cambio
SELECT * FROM EstInsumo;
```

### **B. Actualizar descripciones de incidencias existentes:**

```sql
-- Opcional: actualizar incidencias viejas
UPDATE Incidentes 
SET Descripcion = REPLACE(Descripcion, 'Estado: Agotado', 'Estado: No Disponible')
WHERE Descripcion LIKE '%Agotado%';
```

---

## **🔧 7. Cambios en Backend**

### **DevolucionService.java:**
```java
// Línea 199 - Cambiar nombre de variable
EstInsumo estadoNoDisponible = estInsumoRepository.findById(3)
    .orElseThrow(() -> new RuntimeException("Estado 'No Disponible' no encontrado"));
insumo.setEstInsumo(estadoNoDisponible);
```

### **InsumoService.java (NUEVO MÉTODO):**
```java
/**
 * Obtener stock real disponible (excluye rotos/perdidos)
 */
public long getStockDisponiblePorTipo(Integer idTipoInsumo) {
    TipoInsumo tipo = tipoInsumoRepository.findById(idTipoInsumo)
        .orElseThrow(() -> new RuntimeException("Tipo no encontrado"));
    
    // Solo cuenta estado "Disponible" (ID=1)
    return insumoRepository.findByTipoInsumo(tipo).stream()
        .filter(i -> i.getEstInsumo().getIdEstInsumo() == 1)
        .count();
}
```

---

## **🎨 8. Cambios en Frontend**

### **A. Filtros en ListaIncidentes.jsx:**
Agregar filtro por devolución:
```jsx
// En URL: /incidentes?devolucion=5
const [searchParams] = useSearchParams();
const idDevolucion = searchParams.get('devolucion');

// Filtrar incidentes de esa devolución
const incidentesFiltrados = incidentes.filter(i => 
  !idDevolucion || i.devolucion?.idDevolucion === parseInt(idDevolucion)
);
```

### **B. Paginación en ListaIncidentes.jsx:**
Igual que en devoluciones (10 items por página).

---

## **✅ 9. Checklist de Implementación**

### **Base de Datos:**
- [ ] Ejecutar `migracion_estado_no_disponible.sql`
- [ ] Verificar que estado 3 ahora es "No Disponible"

### **Backend:**
- [ ] DevolucionService: cambiar `estadoAgotado` → `estadoNoDisponible`
- [ ] InsumoService: método `getStockDisponiblePorTipo()`
- [ ] ReporteService: excluir estado 3 de conteos

### **Frontend:**
- [x] ListaDevoluciones: paginación implementada ✅
- [ ] ListaIncidentes: agregar paginación
- [ ] DetalleDevolucion: mostrar alert si hay incidencias
- [ ] Actualizar mensajes "Agotado" → "No Disponible"

---

## **📊 10. Ejemplo de Flujo Completo**

### **Caso: Balanza Rota**

```
1. Estudiante devuelve Balanza #2 marcada como "Dañada"
   Observaciones: "Dial roto"

2. Backend procesa:
   - Balanza #2: Estado → No Disponible (ID=3)
   - Crea Incidencia #15:
     * Descripción: "Insumo dañado: Balanza (ID: 2). Dial roto"
     * Estudiante: Pedro Ramírez
     * Estado: Reportado
     * Devolución: #DEV005
   - Envía notificación a admins

3. Admin ve notificación:
   - Click → /incidentes/15
   - Lee descripción completa
   - Botón "Poner en Revisión" → cambia estado

4. Admin evalúa:
   - ¿Reparable? → "Resolver" → insumo vuelve a Disponible
   - ¿Irreparable? → Queda en No Disponible → NO CUENTA EN STOCK

5. Stock actualizado:
   - Antes: 5 balanzas (incluyendo la rota)
   - Después: 4 balanzas disponibles
   - Balanza #2: No aparece en conteo de stock
   - Balanza #2: No aparece en inventario disponible
```

---

## **🎯 Resumen**

### **Flujo de Incidentes: ✅ BIEN IMPLEMENTADO**
- Generación automática ✅
- Notificaciones ✅
- Gestión de estados ✅

### **Problemas a Corregir:**
1. ⚠️ Renombrar "Agotado" → "No Disponible"
2. ⚠️ Excluir estado 3 de conteos de stock
3. ⚠️ Agregar paginación a incidentes
4. ⚠️ Mejorar UI para ver incidencias relacionadas

### **Próximos Pasos:**
1. Ejecutar migración SQL
2. Actualizar DevolucionService.java
3. Implementar getStockDisponiblePorTipo()
4. Agregar paginación a incidentes

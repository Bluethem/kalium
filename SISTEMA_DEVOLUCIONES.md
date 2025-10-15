# 🔄 Sistema de Devoluciones - Kalium

## 📋 Resumen

El sistema de devoluciones permite registrar cuando un estudiante devuelve los insumos de una entrega, verificar su estado, y generar incidencias automáticamente en caso de daños.

---

## 🎯 Flujo Completo

```
1. ESTUDIANTE DEVUELVE INSUMOS
   └─ Laboratorista crea Devolución desde la Entrega

2. VERIFICAR ESTADO DE CADA INSUMO
   ├─ Insumo OK → Estado: Disponible (ID=1) ✅
   ├─ Insumo Dañado → Estado: Agotado (ID=3) ❌
   │  └─ Genera Incidencia automáticamente 🚨
   └─ Insumo Perdido → Estado: Agotado (ID=3) ❌
      └─ Genera Incidencia automáticamente 🚨

3. ACTUALIZAR ESTADO DE DEVOLUCIÓN
   ├─ Todos OK → Completa
   ├─ Faltan insumos → Incompleta
   └─ Hay daños → Con Daños

4. INCIDENCIAS GENERADAS
   ├─ Descripción automática
   ├─ Estudiante responsable asignado
   ├─ Notificación a administradores
   └─ Estado: Reportado
```

---

## 🗃️ Estructura de Base de Datos

### **Tabla: Devolucion**

```sql
CREATE TABLE Devolucion
(
  IDDevolucion INT NOT NULL AUTO_INCREMENT,
  FechaDevolucion DATE NOT NULL,
  HoraDevolucion DATETIME NOT NULL,
  IDPedido INT NOT NULL,
  IDEstDevolucion INT NOT NULL,  -- Completa, Incompleta, Con Daños
  IDEntrega INT NOT NULL,
  PRIMARY KEY (IDDevolucion),
  ...
);
```

### **Tabla: DevolucionDetalle (ACTUALIZADA)**

```sql
CREATE TABLE DevolucionDetalle
(
  IDDevolucionDetalle INT NOT NULL AUTO_INCREMENT,
  IDDevolucion INT NOT NULL,
  IDInsumo INT NOT NULL,
  EstadoInsumoDevuelto VARCHAR(50) NOT NULL DEFAULT 'OK',  -- ✅ NUEVO
  Observaciones VARCHAR(255) NULL,                         -- ✅ NUEVO
  PRIMARY KEY (IDDevolucionDetalle),
  ...
);
```

**Estados Válidos:**
- `'OK'` - Insumo devuelto en buen estado
- `'Dañado'` - Insumo con daños físicos
- `'Perdido'` - Insumo no devuelto

---

## ☕ Backend - Lógica Implementada

### **DevolucionService.agregarDetalle()**

```java
public DevolucionDetalle agregarDetalle(DevolucionDetalle detalle) {
    // 1. Validar devolución e insumo
    
    // 2. Determinar estado del insumo devuelto
    String estadoDevuelto = detalle.getEstadoInsumoDevuelto();
    
    // 3. Actualizar estado según condición
    if ("OK".equalsIgnoreCase(estadoDevuelto)) {
        insumo.setEstInsumo(estadoDisponible); // ID = 1
    } 
    else if ("Dañado" || "Perdido") {
        insumo.setEstInsumo(estadoAgotado); // ID = 3
        generarIncidenciaPorDanio(devolucion, insumo, observaciones); // ✅
    }
    
    // 4. Eliminar EntregaInsumo (ya no está en uso)
    entregaInsumoRepository.findByEntrega(entrega)
        .filter(ei -> ei.getInsumo().equals(insumo))
        .forEach(entregaInsumoRepository::delete);
    
    return devolucionDetalleRepository.save(detalle);
}
```

### **generarIncidenciaPorDanio() - AUTOMÁTICO**

```java
private void generarIncidenciaPorDanio(Devolucion devolucion, Insumo insumo, String observaciones) {
    Incidentes incidente = new Incidentes();
    
    incidente.setDescripcion("Insumo dañado: " + insumo.getTipoInsumo().getNombre());
    incidente.setFechaIncidente(LocalDate.now());
    incidente.setDevolucion(devolucion);
    incidente.setEstudiante(devolucion.getEntrega().getEstudiante());
    
    incidenteService.guardar(incidente); // Incluye notificaciones ✅
}
```

---

## 🎨 Frontend - Recomendaciones

### **DetalleDevolucion.jsx - MEJORAS NECESARIAS**

**Actualmente:** Solo muestra información básica.

**Debes Agregar:**

1. **Lista de insumos de la entrega**
```jsx
const [insumosEntrega, setInsumosEntrega] = useState([]);
const [insumosDevueltos, setInsumosDevueltos] = useState([]);

// Cargar insumos de la entrega
const cargarInsumosEntrega = async (idEntrega) => {
  const response = await entregaService.getInsumosByEntrega(idEntrega);
  setInsumosEntrega(response.data);
};
```

2. **Formulario para registrar devolución de cada insumo**
```jsx
<div className="bg-white rounded-lg p-6">
  <h3>Insumos a Devolver</h3>
  {insumosEntrega.map(insumo => (
    <div key={insumo.idInsumo} className="flex items-center gap-4 p-4 border">
      <div className="flex-1">
        <p>{insumo.tipoInsumo.nombreTipoInsumo}</p>
        <p className="text-sm text-gray-500">ID: {insumo.idInsumo}</p>
      </div>
      
      {/* Radio buttons para estado */}
      <div className="flex gap-4">
        <label>
          <input 
            type="radio" 
            name={`estado-${insumo.idInsumo}`}
            value="OK"
            defaultChecked
          />
          ✅ OK
        </label>
        <label>
          <input 
            type="radio" 
            name={`estado-${insumo.idInsumo}`}
            value="Dañado"
          />
          ❌ Dañado
        </label>
        <label>
          <input 
            type="radio" 
            name={`estado-${insumo.idInsumo}`}
            value="Perdido"
          />
          🚫 Perdido
        </label>
      </div>
      
      {/* Observaciones */}
      <input
        type="text"
        placeholder="Observaciones (opcional)"
        className="border rounded px-2 py-1"
      />
      
      <button 
        onClick={() => registrarInsumoDevuelto(insumo, estado, observaciones)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Registrar
      </button>
    </div>
  ))}
</div>
```

3. **Función para registrar insumos**
```jsx
const registrarInsumoDevuelto = async (insumo, estado, observaciones) => {
  try {
    const detalle = {
      devolucion: { idDevolucion: devolucion.idDevolucion },
      insumo: { idInsumo: insumo.idInsumo },
      estadoInsumoDevuelto: estado,
      observaciones: observaciones
    };
    
    await devolucionService.agregarDetalle(detalle);
    
    // Actualizar lista
    cargarDetalles();
    
    if (estado !== 'OK') {
      alert('⚠️ Incidencia generada automáticamente');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

4. **Mostrar insumos ya devueltos**
```jsx
<div className="bg-gray-50 rounded-lg p-6 mt-6">
  <h3>Insumos Devueltos</h3>
  <table>
    <thead>
      <tr>
        <th>Insumo</th>
        <th>Estado</th>
        <th>Observaciones</th>
      </tr>
    </thead>
    <tbody>
      {insumosDevueltos.map(detalle => (
        <tr key={detalle.idDevolucionDetalle}>
          <td>{detalle.insumo.tipoInsumo.nombreTipoInsumo}</td>
          <td>
            <span className={getBadgeClass(detalle.estadoInsumoDevuelto)}>
              {detalle.estadoInsumoDevuelto}
            </span>
          </td>
          <td>{detalle.observaciones || '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 📊 Ejemplo Práctico

### **Entrega #15**
- Estudiante: Pedro Ramírez
- Insumos entregados:
  - Balanza #1
  - Balanza #2
  - Probeta #7

### **Proceso de Devolución:**

```
1. Crear Devolución
   POST /api/devoluciones
   {
     "fechaDevolucion": "2025-01-20",
     "horaDevolucion": "2025-01-20T14:30:00",
     "pedido": { "idPedido": 5 },
     "entrega": { "idEntrega": 15 },
     "estDevolucion": { "idEstDevolucion": 1 }
   }

2. Devolver Balanza #1 (OK)
   POST /api/devoluciones/1/detalles
   {
     "devolucion": { "idDevolucion": 1 },
     "insumo": { "idInsumo": 1 },
     "estadoInsumoDevuelto": "OK",
     "observaciones": null
   }
   → Insumo #1: En Uso → Disponible ✅

3. Devolver Balanza #2 (Dañada)
   POST /api/devoluciones/1/detalles
   {
     "devolucion": { "idDevolucion": 1 },
     "insumo": { "idInsumo": 2 },
     "estadoInsumoDevuelto": "Dañado",
     "observaciones": "Dial roto"
   }
   → Insumo #2: En Uso → Agotado ❌
   → Incidencia #5 creada automáticamente 🚨
   → Notificación enviada a administradores 📧

4. Devolver Probeta #7 (OK)
   POST /api/devoluciones/1/detalles
   {
     "devolucion": { "idDevolucion": 1 },
     "insumo": { "idInsumo": 7 },
     "estadoInsumoDevuelto": "OK",
     "observaciones": null
   }
   → Insumo #7: En Uso → Disponible ✅

5. Actualizar Estado de Devolución
   PUT /api/devoluciones/1
   {
     "estDevolucion": { "idEstDevolucion": 3 } // "Con Daños"
   }
```

### **Resultado:**

**Base de Datos:**
```sql
-- Tabla Insumo
+----+----------+-------------+
| ID | Tipo     | Estado      |
+----+----------+-------------+
| 1  | Balanza  | Disponible  | ✅ Listo para nuevo pedido
| 2  | Balanza  | Agotado     | ❌ Necesita reemplazo
| 7  | Probeta  | Disponible  | ✅ Listo para nuevo pedido
+----+----------+-------------+

-- Tabla Incidentes
+----+---------------------------------------------+-------------+
| ID | Descripcion                                 | Estado      |
+----+---------------------------------------------+-------------+
| 5  | Insumo dañado: Balanza (ID: 2). Dial roto  | Reportado   |
+----+---------------------------------------------+-------------+

-- Tabla Notificacion
+----+----------------------+------------------+--------+
| ID | Titulo               | Tipo             | Leída  |
+----+----------------------+------------------+--------+
| 12 | Incidencia reportada | INCIDENTE        | false  |
+----+----------------------+------------------+--------+
```

---

## ✅ Checklist de Implementación

### **Backend - COMPLETADO**
- [x] Migración SQL (`migracion_devolucion_estado_insumo.sql`)
- [x] Campo `EstadoInsumoDevuelto` en `DevolucionDetalle`
- [x] Campo `Observaciones` en `DevolucionDetalle`
- [x] Entidad `DevolucionDetalle.java` actualizada
- [x] `DevolucionService.agregarDetalle()` con lógica de estados
- [x] Generación automática de incidencias
- [x] Eliminación de `EntregaInsumo` al devolver

### **Frontend - PENDIENTE**
- [ ] Actualizar `DetalleDevolucion.jsx`
- [ ] Mostrar lista de insumos de la entrega
- [ ] Formulario para marcar estado (OK/Dañado/Perdido)
- [ ] Campo de observaciones
- [ ] Mostrar insumos ya devueltos
- [ ] Alert cuando se genera incidencia
- [ ] Botón para finalizar devolución

### **API Endpoints Necesarios**
- [x] `POST /api/devoluciones` - Crear devolución
- [x] `POST /api/devoluciones/{id}/detalles` - Agregar insumo devuelto
- [x] `GET /api/devoluciones/{id}/detalles` - Listar insumos devueltos
- [x] `GET /api/entregas/{id}/insumos` - Listar insumos de entrega ✅ (Ya existe)

---

## 🚀 Migración de Base de Datos

Para aplicar los cambios:

```bash
mysql -u root -p kaliumdb < database/migracion_devolucion_estado_insumo.sql
```

Esto agregará:
- ✅ `DevolucionDetalle.EstadoInsumoDevuelto VARCHAR(50) NOT NULL`
- ✅ `DevolucionDetalle.Observaciones VARCHAR(255) NULL`

---

## 🎯 Próximos Pasos

1. **Aplicar migración SQL**
2. **Reiniciar backend** (para cargar nueva entidad)
3. **Actualizar `DetalleDevolucion.jsx`** con el formulario sugerido
4. **Probar flujo completo:**
   - Crear devolución
   - Registrar insumos OK
   - Registrar insumos dañados
   - Verificar incidencia generada automáticamente
   - Verificar notificación enviada

---

✅ **Backend listo para gestionar devoluciones con estados de insumos e incidencias automáticas**
⚠️ **Frontend requiere actualización para interfaz completa**

# 🚚 Sistema de Entregas por Grupos - Kalium

## 📋 Descripción

Sistema completo de generación masiva de entregas basado en la cantidad de grupos de un pedido. Permite generar N entregas automáticamente y asignar estudiantes individualmente.

---

## 🎯 Funcionalidad Principal

### **Flujo Completo:**

```
1️⃣ PEDIDO APROBADO
   ↓
2️⃣ GENERAR ENTREGAS (Admin hace clic)
   Pedido con 5 grupos → Se crean 5 entregas vacías
   ↓
3️⃣ ASIGNAR ESTUDIANTES
   Para cada entrega:
   - Seleccionar estudiante
   - Guardar asignación
   ↓
4️⃣ PEDIDO MARCADO COMO "ENTREGADO"
   - Todas las entregas registradas
   - Estado del pedido cambia automáticamente
```

---

## 🏗️ Arquitectura Backend

### **1. EntregaService - Métodos Nuevos:**

#### **`generarEntregasPorGrupos(Integer idPedido)`**
- **Input:** ID del pedido aprobado
- **Proceso:**
  1. Verifica que el pedido esté aprobado (estado 2 o 3)
  2. Verifica que NO existan entregas previas
  3. Obtiene `cantGrupos` del pedido
  4. Crea N entregas con fecha/hora del horario
  5. Marca detalles del pedido como "Entregado" (estado 3)
  6. Cambia pedido a estado "Entregado" (estado 4)
- **Output:** Lista de entregas creadas (sin estudiante asignado)

#### **`asignarEstudianteAEntrega(Integer idEntrega, Integer idEstudiante)`**
- **Input:** ID de entrega + ID de estudiante
- **Proceso:** Asigna el estudiante a la entrega específica
- **Output:** Entrega actualizada

#### **`pedidoTieneEntregas(Integer idPedido)`**
- **Input:** ID del pedido
- **Output:** `true` si ya tiene entregas, `false` si no

#### **`obtenerEntregasSinEstudiante(Integer idPedido)`**
- **Input:** ID del pedido
- **Output:** Lista de entregas sin estudiante asignado

---

## 🌐 API Endpoints

### **POST `/api/entregas/generar/{idPedido}`**
Genera entregas masivas para un pedido.

**Ejemplo:**
```bash
POST http://localhost:8080/api/entregas/generar/5
```

**Response (201 Created):**
```json
[
  {
    "idEntrega": 15,
    "fechaEntrega": "2025-01-25",
    "horaEntrega": "2025-01-25T14:00:00",
    "pedido": { "idPedido": 5 },
    "estudiante": null
  },
  {
    "idEntrega": 16,
    "fechaEntrega": "2025-01-25",
    "horaEntrega": "2025-01-25T14:00:00",
    "pedido": { "idPedido": 5 },
    "estudiante": null
  }
  // ... 3 entregas más
]
```

### **PUT `/api/entregas/{idEntrega}/asignar-estudiante/{idEstudiante}`**
Asigna un estudiante a una entrega.

**Ejemplo:**
```bash
PUT http://localhost:8080/api/entregas/15/asignar-estudiante/3
```

**Response (200 OK):**
```json
{
  "idEntrega": 15,
  "fechaEntrega": "2025-01-25",
  "horaEntrega": "2025-01-25T14:00:00",
  "pedido": { "idPedido": 5 },
  "estudiante": {
    "idEstudiante": 3,
    "nombre": "Miguel",
    "apellido": "Fernández"
  }
}
```

### **GET `/api/entregas/verificar/{idPedido}`**
Verifica si un pedido ya tiene entregas generadas.

**Response:**
```json
true  // o false
```

### **GET `/api/entregas/pendientes/{idPedido}`**
Obtiene entregas sin estudiante asignado.

**Response:**
```json
[
  {
    "idEntrega": 17,
    "estudiante": null,
    ...
  }
]
```

---

## 💻 Frontend - Componentes

### **1. GenerarEntregas.jsx**
**Ruta:** `/entregas/generar/:idPedido`

**Funcionalidad:**
- Muestra información del pedido
- Botón "Generar Entregas" (crea N entregas vacías)
- Lista de entregas con selector de estudiante
- Botón "Guardar" por cada entrega
- Indicador visual cuando todas están asignadas
- Botón "Finalizar" para volver al pedido

**Estados:**
```jsx
const [pedido, setPedido] = useState(null);
const [entregas, setEntregas] = useState([]);
const [asignaciones, setAsignaciones] = useState({});
```

**Flujo:**
1. Carga el pedido
2. Verifica si ya tiene entregas
3. Si no → Muestra botón "Generar"
4. Si sí → Muestra lista para asignar estudiantes
5. Al finalizar → Redirige a DetallePedido

### **2. ListaEntregas.jsx (Actualizado)**
- ✅ Muestra pedidos aprobados sin entregas generadas
- ✅ Botón directo "Generar N Entregas" por cada pedido
- ✅ Paginación completa (5, 10, 25, 50 items)
- ✅ Filtros de búsqueda
- ✅ Navegación de páginas
- ⚠️ **Eliminado** botón "Registrar Entrega" (ya no necesario)

### **3. DetallePedido.jsx (Modificado)**
Agregado botón "Generar Entregas" visible solo si:
- Estado del pedido es "Aprobado" (2) o "En Preparación" (3)

```jsx
{(pedido.estPedido?.idEstPedido === 2 || pedido.estPedido?.idEstPedido === 3) && (
  <button onClick={() => navigate(`/entregas/generar/${id}`)}>
    Generar Entregas
  </button>
)}
```

### **4. NuevaEntrega.jsx**
⚠️ **ELIMINADO** - Ya no es necesario con el sistema automatizado

---

## 🔄 Flujo de Estados

### **Estados del Pedido:**
```
1. Pendiente → 2. Aprobado → 4. Entregado
              ↓
         3. En Preparación
```

### **Estados del PedidoDetalle:**
```
1. Pendiente → 2. Reservado → 3. Entregado
                            ↓
                         4. Cancelado
```

### **Estados del Insumo:**
```
1. Disponible → 5. Reservado → 2. En Uso → 1. Disponible (Devolución)
                                        ↓
                                 3. Agotado/Dañado
```

| Estado | ID | Descripción |
|--------|----| ----------- |
| Disponible | 1 | Listo para reservar |
| En Uso | 2 | Asignado a una entrega activa |
| Agotado | 3 | No disponible |
| En Mantenimiento | 4 | En reparación |
| Reservado | 5 | Apartado para un pedido aprobado |

### **Cambios Automáticos:**
Cuando se generan las entregas:
- `PedidoDetalle.estado` → 3 (Entregado)
- `Pedido.estado` → 4 (Entregado)
- **`Insumo.estado` → 2 (En Uso)** ← De "Reservado" a "En Uso"
- Se crean automáticamente `EntregaInsumo` por cada insumo del pedido

---

## 📊 Ejemplo Práctico

### **Escenario:**
```
Pedido #5
- Curso: Química Orgánica
- Grupos: 5
- Estado: Aprobado
- Fecha Entrega: 2025-01-25 14:00
```

### **Paso 1: Generar Entregas**
```
Admin va a: /pedidos/5
Click en "Generar Entregas"
Redirige a: /entregas/generar/5
Click en "Generar Entregas"

Resultado:
✅ 5 entregas creadas
✅ Pedido cambia a "Entregado"
```

### **Paso 2: Asignar Estudiantes**
```
Pantalla muestra 5 entregas:

Entrega #15: [Seleccionar estudiante ▼] → Miguel Fernández [Guardar]
Entrega #16: [Seleccionar estudiante ▼] → Ana Martínez [Guardar]
Entrega #17: [Seleccionar estudiante ▼] → Carlos López [Guardar]
Entrega #18: [Seleccionar estudiante ▼] → Laura Torres [Guardar]
Entrega #19: [Seleccionar estudiante ▼] → Pedro Ramírez [Guardar]

Todas asignadas ✅ → Botón "Finalizar" aparece
```

### **Paso 3: Consultar Entregas**
```
Admin va a: /entregas
Ve 5 entregas nuevas:

#ENT015 - Miguel Fernández - Pedido #005
#ENT016 - Ana Martínez - Pedido #005
#ENT017 - Carlos López - Pedido #005
#ENT018 - Laura Torres - Pedido #005
#ENT019 - Pedro Ramírez - Pedido #005
```

---

## 🔐 Validaciones Backend

### **Al Generar Entregas:**
1. ✅ Pedido existe
2. ✅ Pedido está aprobado (estado 2 o 3)
3. ✅ NO existen entregas previas
4. ✅ Cantidad de grupos > 0

### **Al Asignar Estudiante:**
1. ✅ Entrega existe
2. ✅ Estudiante existe
3. ✅ Estudiante no asignado previamente (opcional)

---

## 🎨 UI/UX Features

### **Indicadores Visuales:**
- 🔢 Numeración de entregas (1, 2, 3...)
- ✅ Checkmark verde cuando está asignada
- 📊 Contador "Asignadas: 3/5"
- 🎯 Botón "Finalizar" solo visible cuando todas están listas

### **Mensajes de Éxito:**
- "Entregas generadas exitosamente"
- "Estudiante asignado correctamente"
- Toast notifications en tiempo real

### **Prevención de Errores:**
- Botón "Guardar" deshabilitado si no selecciona estudiante
- No permite generar entregas duplicadas
- Validación de permisos

---

## 📈 Ventajas del Sistema

✅ **Automatización:** Un clic genera todas las entregas
✅ **Trazabilidad:** Cada entrega tiene su ID único
✅ **Flexibilidad:** Asignación individual de estudiantes
✅ **Escalable:** Funciona para 1 o 100 grupos
✅ **Integrado:** Se conecta con sistema de reservas
✅ **User-friendly:** UI intuitiva y clara

---

## 🚀 Para Probar

### **1. Crear Pedido:**
```bash
# Frontend
http://localhost:5173/pedidos/nuevo
- Seleccionar 5 grupos
- Agregar insumos
- Crear pedido
```

### **2. Aprobar Pedido:**
```bash
# Frontend
http://localhost:5173/pedidos/{id}
- Click "Aprobar Pedido"
```

### **3. Generar Entregas:**
```bash
# Frontend
http://localhost:5173/pedidos/{id}
- Click "Generar Entregas"
- Click "Generar Entregas" (nuevamente)
- Asignar 5 estudiantes
- Click "Finalizar"
```

### **4. Verificar:**
```bash
# Frontend
http://localhost:5173/entregas
- Ver 5 entregas nuevas
```

---

## 🔮 Futuras Mejoras (Opcionales)

1. **Asignación Masiva:** Botón para asignar todos a la vez
2. **Plantillas:** Grupos predefinidos de estudiantes
3. **QR Codes:** Generar QR por entrega para escaneo rápido
4. **Notificaciones:** Email/SMS a estudiantes cuando se asignan
5. **Historial:** Log de cambios de asignación
6. **Reportes:** PDF con todas las entregas del pedido

---

## 📞 Endpoints Completos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/entregas/generar/{idPedido}` | Genera N entregas |
| PUT | `/api/entregas/{idEntrega}/asignar-estudiante/{idEstudiante}` | Asigna estudiante |
| GET | `/api/entregas/verificar/{idPedido}` | Verifica si tiene entregas |
| GET | `/api/entregas/pendientes/{idPedido}` | Lista entregas sin estudiante |
| GET | `/api/entregas/pedido/{idPedido}` | Lista todas las entregas del pedido |

---

**✅ Sistema de entregas por grupos implementado y funcional**

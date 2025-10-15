# 🧪 **Sistema de Experimentos + Generación Automática de Pedidos**

## **📋 Estructura Actual**

### **Base de Datos:**

```sql
Experimento
├── IDExperimento (PK)
└── NombreExperimento

DetalleExperimento
├── IDDetalleExperimento (PK)
├── CantInsumoExperimento  -- Cantidad necesaria
├── IDTipoInsumo (FK)
└── IDExperimento (FK)
```

### **Ejemplo de Datos:**

```sql
-- Experimento: Titulación Ácido-Base
IDExperimento = 1, NombreExperimento = 'Titulación Ácido-Base'

-- Detalles:
- 50ml de Ácido Sulfúrico (IDTipoInsumo = 1)
- 25g de Hidróxido (IDTipoInsumo = 2)
```

---

## **🎯 Funcionalidad Requerida**

### **Flujo 1: Pedido Desde Experimento (AUTOMÁTICO)**

```
Instructor selecciona experimento
    ↓
Ve lista de insumos necesarios
    ↓
Click "Generar Pedido"
    ↓
Sistema crea pedido automáticamente:
    - Título: "Pedido para: [Nombre Experimento]"
    - Estado: "Creado" (ID=1)
    - TipoPedido: "Experimento de Investigación" (ID=2)
    - Fecha: Hoy
    - FechaLimite: [Instructor elige]
    - Horario: [Instructor elige]
    - NumGrupos: [Instructor elige]
    ↓
Crea PedidoDetalle automáticamente:
    - Por cada DetalleExperimento
    - Cantidad = CantInsumoExperimento × NumGrupos
    ↓
Redirige a /pedidos/{idPedido} (modo edición)
    ↓
Instructor puede:
    - Ajustar cantidades
    - Agregar/eliminar insumos
    - Cambiar fechas
    - Guardar pedido
```

### **Flujo 2: Pedido Manual (Tu Compañero)**

```
Instructor crea pedido desde cero
    ↓
/pedidos/nuevo
    ↓
Selecciona insumos manualmente
    ↓
Define cantidades, fechas, etc.
    ↓
Guarda pedido
```

---

## **🔧 Implementación Necesaria**

### **1️⃣ Backend: Método para Generar Pedido**

**Archivo:** `PedidoService.java`

```java
/**
 * Generar pedido automáticamente desde un experimento
 */
public Pedido generarPedidoDesdeExperimento(Integer idExperimento, 
                                           Integer idInstructor,
                                           LocalDate fechaLimite,
                                           Integer idHorario,
                                           Integer numGrupos) {
    // 1. Validar experimento
    Experimento experimento = experimentoRepository.findById(idExperimento)
        .orElseThrow(() -> new RuntimeException("Experimento no encontrado"));
    
    // 2. Obtener detalles del experimento
    List<DetalleExperimento> detalles = detalleExperimentoRepository
        .findByExperimento(experimento);
    
    if (detalles.isEmpty()) {
        throw new RuntimeException("El experimento no tiene insumos definidos");
    }
    
    // 3. Obtener instructor
    Instructor instructor = instructorRepository.findById(idInstructor)
        .orElseThrow(() -> new RuntimeException("Instructor no encontrado"));
    
    // 4. Obtener horario
    Horario horario = horarioRepository.findById(idHorario)
        .orElseThrow(() -> new RuntimeException("Horario no encontrado"));
    
    // 5. Crear pedido
    Pedido pedido = new Pedido();
    pedido.setTituloPedido("Pedido para: " + experimento.getNombreExperimento());
    pedido.setFechaPedido(LocalDate.now());
    pedido.setFechaLimite(fechaLimite);
    pedido.setInstructor(instructor);
    pedido.setHorario(horario);
    pedido.setNumGrupos(numGrupos);
    
    // Estado: Creado (ID=1)
    EstPedido estadoCreado = estPedidoRepository.findById(1)
        .orElseThrow(() -> new RuntimeException("Estado 'Creado' no encontrado"));
    pedido.setEstPedido(estadoCreado);
    
    // Tipo: Experimento de Investigación (ID=2)
    TipoPedido tipoExperimento = tipoPedidoRepository.findById(2)
        .orElseThrow(() -> new RuntimeException("Tipo 'Experimento' no encontrado"));
    pedido.setTipoPedido(tipoExperimento);
    
    pedido = pedidoRepository.save(pedido);
    
    // 6. Crear detalles del pedido (PedidoDetalle)
    for (DetalleExperimento detalle : detalles) {
        PedidoDetalle pedidoDetalle = new PedidoDetalle();
        pedidoDetalle.setPedido(pedido);
        pedidoDetalle.setTipoInsumo(detalle.getTipoInsumo());
        
        // Cantidad = cantidad por experimento × número de grupos
        pedidoDetalle.setCantidadPedida(detalle.getCantInsumoExperimento() * numGrupos);
        
        // Estado inicial: Creado (ID=1)
        EstPedidoDetalle estadoDetalleCreado = estPedidoDetalleRepository.findById(1)
            .orElseThrow(() -> new RuntimeException("Estado detalle no encontrado"));
        pedidoDetalle.setEstPedidoDetalle(estadoDetalleCreado);
        
        pedidoDetalleRepository.save(pedidoDetalle);
    }
    
    return pedido;
}
```

---

### **2️⃣ Backend: Controller**

**Archivo:** `PedidoController.java`

```java
@PostMapping("/experimentos/{idExperimento}/generar-pedido")
public ResponseEntity<Pedido> generarPedidoDesdeExperimento(
        @PathVariable Integer idExperimento,
        @RequestBody Map<String, Object> datos) {
    
    try {
        Integer idInstructor = (Integer) datos.get("idInstructor");
        String fechaLimiteStr = (String) datos.get("fechaLimite");
        Integer idHorario = (Integer) datos.get("idHorario");
        Integer numGrupos = (Integer) datos.get("numGrupos");
        
        LocalDate fechaLimite = LocalDate.parse(fechaLimiteStr);
        
        Pedido pedido = pedidoService.generarPedidoDesdeExperimento(
            idExperimento,
            idInstructor,
            fechaLimite,
            idHorario,
            numGrupos
        );
        
        return ResponseEntity.ok(pedido);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}
```

---

### **3️⃣ Frontend: Modal en DetalleExperimento.jsx**

**Botón "Generar Pedido":**

```jsx
<button
  onClick={() => setShowModalGenerar(true)}
  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
>
  <span className="material-symbols-outlined text-base">add_shopping_cart</span>
  Generar Pedido
</button>
```

**Modal de Configuración:**

```jsx
{showModalGenerar && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Generar Pedido</h3>
      <p className="text-sm text-gray-600 mb-6">
        Se creará un pedido con los {detalles.length} insumos de este experimento
      </p>
      
      {/* Instructor (si hay múltiples) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Instructor</label>
        <select className="w-full rounded-md border px-3 py-2">
          {/* Cargar desde API */}
        </select>
      </div>
      
      {/* Fecha Límite */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Fecha Límite</label>
        <input 
          type="date" 
          className="w-full rounded-md border px-3 py-2"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
        />
      </div>
      
      {/* Horario */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Horario</label>
        <select className="w-full rounded-md border px-3 py-2">
          {horarios.map(h => (
            <option key={h.idHorario} value={h.idHorario}>
              {h.diaSemana} {h.horaInicio} - {h.horaFin}
            </option>
          ))}
        </select>
      </div>
      
      {/* Número de Grupos */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Número de Grupos</label>
        <input 
          type="number" 
          min="1"
          className="w-full rounded-md border px-3 py-2"
          value={numGrupos}
          onChange={(e) => setNumGrupos(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Las cantidades se multiplicarán por el número de grupos
        </p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setShowModalGenerar(false)}
          className="flex-1 border rounded-lg px-4 py-2"
        >
          Cancelar
        </button>
        <button 
          onClick={handleGenerarPedido}
          className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2"
        >
          Generar
        </button>
      </div>
    </div>
  </div>
)}
```

**Función handleGenerarPedido:**

```jsx
const handleGenerarPedido = async () => {
  try {
    const response = await pedidoService.generarPedidoDesdeExperimento(id, {
      idInstructor: instructorSeleccionado,
      fechaLimite,
      idHorario: horarioSeleccionado,
      numGrupos: parseInt(numGrupos)
    });
    
    // Redirigir al pedido creado
    navigate(`/pedidos/${response.data.idPedido}`);
  } catch (error) {
    console.error('Error:', error);
    alert('No se pudo generar el pedido');
  }
};
```

---

### **4️⃣ Frontend: API Service**

**Archivo:** `api.js`

```javascript
export const pedidoService = {
  // ... métodos existentes
  
  generarPedidoDesdeExperimento: (idExperimento, datos) => 
    api.post(`/experimentos/${idExperimento}/generar-pedido`, datos),
};
```

---

## **📊 Ejemplo de Uso**

### **Escenario:**

**Experimento:** Titulación Ácido-Base (EXP001)

**Insumos necesarios:**
- 50ml Ácido Sulfúrico
- 25g Hidróxido

**Configuración del pedido:**
- Instructor: Prof. Carlos Méndez
- Fecha Límite: 2025-10-20
- Horario: Lunes 14:00-16:00
- Número de Grupos: 3

### **Resultado:**

**Pedido creado (PED045):**
- Título: "Pedido para: Titulación Ácido-Base"
- Estado: Creado
- Tipo: Experimento de Investigación
- Fecha: 2025-10-14
- Fecha Límite: 2025-10-20

**Detalles del pedido:**
- 150ml Ácido Sulfúrico (50ml × 3 grupos)
- 75g Hidróxido (25g × 3 grupos)

**Después:**
- Instructor puede editar cantidades si necesita más/menos
- Administrador puede aprobar el pedido
- Se genera la entrega automáticamente

---

## **🎨 Vista Previa de la Interfaz**

### **ListaExperimentos.jsx:**

```
┌──────────────────────────────────────────────────────┐
│ 🧪 Gestión de Experimentos      [+ Nuevo Experimento]│
├──────────────────────────────────────────────────────┤
│ 🔍 Buscar por ID o nombre...                         │
├──────────────────────────────────────────────────────┤
│ ID    │ Nombre                    │ Insumos │ Acciones│
│ EXP001│ Titulación Ácido-Base    │ 2       │ Ver     │
│ EXP002│ Síntesis de Aspirina     │ 3       │ Ver     │
│ EXP003│ Destilación Simple       │ 1       │ Ver     │
└──────────────────────────────────────────────────────┘
```

### **DetalleExperimento.jsx:**

```
┌──────────────────────────────────────────────────────┐
│ ← Titulación Ácido-Base     [✏️ Editar][🗑️ Eliminar]│
│   Experimento EXP001        [🛒 Generar Pedido]      │
├──────────────────────────────────────────────────────┤
│ Insumos Necesarios (2)                               │
├──────────────────────────────────────────────────────┤
│ • Ácido Sulfúrico (ID: 1)                            │
│   Cantidad: 50ml                                     │
│                                                      │
│ • Hidróxido de Sodio (ID: 2)                        │
│   Cantidad: 25g                                      │
└──────────────────────────────────────────────────────┘
```

### **Modal Generar Pedido:**

```
┌─────────────────────────────┐
│ Generar Pedido              │
├─────────────────────────────┤
│ Se creará un pedido con los │
│ 2 insumos de este exp.      │
│                             │
│ Instructor: [Seleccionar ▼] │
│ Fecha Límite: [2025-10-20] │
│ Horario: [Lunes 14:00 ▼]   │
│ Núm. Grupos: [3]           │
│                             │
│ [Cancelar] [Generar]       │
└─────────────────────────────┘
```

---

## **✅ Checklist de Implementación**

### **Backend:**
- [ ] Agregar método `generarPedidoDesdeExperimento()` en `PedidoService.java`
- [ ] Crear endpoint POST `/experimentos/{id}/generar-pedido` en `PedidoController.java`
- [ ] Validaciones:
  - [ ] Experimento existe
  - [ ] Tiene detalles definidos
  - [ ] Instructor existe
  - [ ] Horario existe
  - [ ] NumGrupos > 0

### **Frontend:**
- [ ] Agregar botón "Generar Pedido" en `DetalleExperimento.jsx`
- [ ] Crear modal de configuración
- [ ] Cargar horarios desde API
- [ ] Cargar instructores desde API (si hay múltiples)
- [ ] Función `handleGenerarPedido()`
- [ ] Actualizar `api.js` con nuevo endpoint
- [ ] Redirigir a `/pedidos/{id}` después de crear

### **Opcional:**
- [ ] Agregar paginación a ListaExperimentos
- [ ] Agregar filtros por tipo de experimento
- [ ] Permitir duplicar experimentos
- [ ] Historial de pedidos generados desde cada experimento

---

## **🔄 Integración con Pedidos Manuales**

Tu compañero está haciendo la pantalla del instructor para crear pedidos manualmente. Las dos funcionalidades son **complementarias**:

| Método | Cuándo Usar |
|--------|-------------|
| **Desde Experimento** | Experimento ya está definido con insumos exactos |
| **Manual** | Necesidades específicas, pedidos personalizados |

**Ambos generan el mismo tipo de objeto:** `Pedido` + `PedidoDetalle[]`

---

## **🚀 Próximos Pasos**

1. Implementar backend (`PedidoService` + `PedidoController`)
2. Actualizar `DetalleExperimento.jsx`
3. Agregar endpoint en `api.js`
4. Probar flujo completo
5. Coordinar con tu compañero sobre campos del pedido

**¿Quieres que implemente ahora el backend y frontend?** 🧪

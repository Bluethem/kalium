# ✅ **Implementación Completa: Sistema de Experimentos → Pedidos**

## **📋 Resumen de lo Implementado**

### **1️⃣ Backend - Java Spring Boot**

#### **PedidoService.java**
✅ Método `generarPedidoDesdeExperimento()` agregado
- Valida experimento, instructor, horario, curso
- Obtiene detalles del experimento (insumos necesarios)
- Crea pedido automáticamente con:
  - Fecha: hoy
  - Estado: Creado (ID=1)
  - Tipo: Experimento de Investigación (ID=2)
  - Cantidad grupos configurable
- Crea PedidoDetalle por cada insumo
  - Cantidad = CantInsumoExperimento × numGrupos
  - Estado: Creado (ID=1)

#### **PedidoController.java**
✅ Endpoint POST `/api/pedidos/experimentos/{id}/generar`
- Recibe: `idInstructor`, `idHorario`, `idCurso`, `cantGrupos`
- Retorna: Pedido creado con HTTP 201

---

### **2️⃣ Frontend - React**

#### **api.js**
✅ Nuevo método:
```javascript
generarPedidoDesdeExperimento: (idExperimento, datos) => 
  api.post(`/pedidos/experimentos/${idExperimento}/generar`, datos)
```

#### **ListaExperimentos.jsx**
✅ Paginación agregada:
- 10 experimentos por página
- Controles: Anterior/Siguiente + números de página
- Scroll automático al cambiar de página

#### **DetalleExperimento.jsx**
✅ Botón "Generar Pedido":
- Deshabilitado si no hay insumos definidos
- Abre modal al hacer click

✅ Modal de configuración:
- **Campos:**
  - Instructor (dropdown)
  - Curso (dropdown)
  - Horario (dropdown)
  - Número de Grupos (input numérico)
- **Resumen en tiempo real:**
  - Número de tipos de insumos
  - Multiplicador de cantidades
  - Tipo de pedido
  - Estado inicial
- **Validaciones:**
  - Todos los campos obligatorios
  - Número de grupos > 0
- **Al generar:**
  - Llama al endpoint del backend
  - Redirige a `/pedidos/{id}` del pedido creado

---

## **🔄 Flujo Completo**

### **Paso a Paso:**

```
1. Usuario navega a /experimentos
   └─→ Ve lista de experimentos (10 por página)

2. Click en "Ver detalle" de un experimento
   └─→ Muestra DetalleExperimento con insumos necesarios

3. Click en "Generar Pedido" (botón azul 🛒)
   └─→ Se abre modal de configuración

4. Completa formulario:
   ├─ Instructor: Prof. Carlos Méndez
   ├─ Curso: Química General
   ├─ Horario: Lunes 14:00-16:00
   └─ Grupos: 3

5. Click "Generar Pedido"
   └─→ Backend crea:
       ├─ Pedido #PED045
       │   ├─ Fecha: 2025-10-15
       │   ├─ Estado: Creado
       │   ├─ Tipo: Experimento de Investigación
       │   └─ CantGrupos: 3
       └─ PedidoDetalles:
           ├─ 50ml × 3 = 150ml Ácido Sulfúrico
           └─ 25g × 3 = 75g Hidróxido

6. Redirige a /pedidos/45
   └─→ Muestra pedido creado (editable)
```

---

## **📊 Ejemplo Práctico**

### **Experimento: Titulación Ácido-Base**

**Insumos definidos:**
- 50ml Ácido Sulfúrico
- 25g Hidróxido de Sodio

**Configuración del pedido:**
- 3 grupos de estudiantes
- Horario: Lunes 14:00

**Resultado:**
- Pedido creado con:
  - 150ml de Ácido (50ml × 3)
  - 75g de Hidróxido (25g × 3)
- Estado: Creado
- Tipo: Experimento de Investigación

---

## **🎨 Interfaz Visual**

### **Lista de Experimentos:**
```
┌────────────────────────────────────────────────┐
│ 🧪 Gestión de Experimentos  [+ Nuevo]         │
├────────────────────────────────────────────────┤
│ ID      │ Nombre                   │ Insumos  │
│ EXP001  │ Titulación Ácido-Base   │ 2        │
│ EXP002  │ Síntesis de Aspirina    │ 3        │
├────────────────────────────────────────────────┤
│ Mostrando 1-10 de 25  [◄ 1 2 3 ►]            │
└────────────────────────────────────────────────┘
```

### **Detalle + Modal:**
```
┌─────────────────────────────────────────────────┐
│ ← Titulación Ácido-Base                        │
│   EXP001  [🛒 Generar Pedido] [✏️] [🗑️]       │
├─────────────────────────────────────────────────┤
│ Insumos Necesarios (2)                         │
│ • Ácido Sulfúrico - 50ml                       │
│ • Hidróxido - 25g                              │
└─────────────────────────────────────────────────┘

        ┌──────────────────────────┐
        │ Generar Pedido Automático│
        ├──────────────────────────┤
        │ Se creará pedido con     │
        │ 2 insumos                │
        │                          │
        │ Instructor: [▼]          │
        │ Curso: [▼]               │
        │ Horario: [▼]             │
        │ Grupos: [3]              │
        │                          │
        │ 📋 Resumen:              │
        │ • 2 tipos de insumos     │
        │ • Cantidades × 3 grupos  │
        │                          │
        │ [Cancelar] [Generar]     │
        └──────────────────────────┘
```

---

## **✅ Checklist Final**

### **Backend:**
- [x] PedidoService.generarPedidoDesdeExperimento()
- [x] PedidoController endpoint POST
- [x] Validaciones de datos
- [x] Creación de Pedido + PedidoDetalles
- [x] Repositories necesarios inyectados

### **Frontend:**
- [x] api.js método actualizado
- [x] ListaExperimentos con paginación
- [x] DetalleExperimento con botón
- [x] Modal de configuración
- [x] Carga de datos (instructores, cursos, horarios)
- [x] Validaciones en frontend
- [x] Redirección a pedido creado

### **Documentación:**
- [x] SISTEMA_EXPERIMENTOS_PEDIDOS.md
- [x] RESUMEN_IMPLEMENTACION_EXPERIMENTOS.md

---

## **🚀 Cómo Probar**

### **1. Backend:**
```bash
cd backend
mvn spring-boot:run
```

### **2. Frontend:**
```bash
cd frontend/frontend-kalium
npm run dev
```

### **3. Navegar a:**
```
http://localhost:5173/experimentos
```

### **4. Flujo de prueba:**
1. Seleccionar un experimento
2. Click "Generar Pedido"
3. Llenar formulario
4. Ver pedido creado

---

## **🔍 Endpoints Disponibles**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/experimentos` | Lista todos los experimentos |
| GET | `/api/experimentos/{id}` | Detalle de experimento |
| GET | `/api/experimentos/{id}/detalles` | Insumos del experimento |
| **POST** | **`/api/pedidos/experimentos/{id}/generar`** | **Generar pedido automático** |
| GET | `/api/instructores` | Lista instructores |
| GET | `/api/cursos` | Lista cursos |
| GET | `/api/horarios` | Lista horarios |

---

## **📝 Notas Importantes**

1. **El pedido creado es editable:** Después de generarlo, el instructor puede modificar cantidades en `/pedidos/{id}`

2. **Validación de insumos:** Si el experimento no tiene insumos definidos, el botón está deshabilitado

3. **Integración con pedidos manuales:** Ambos métodos (automático y manual) crean el mismo tipo de objeto `Pedido`

4. **Estados del pedido:**
   - Creado (ID=1) → inicial
   - Aprobado (ID=2) → después de revisión
   - Entregado (ID=3) → cuando se entrega

5. **Tipos de pedido:**
   - Práctica de Laboratorio (ID=1)
   - **Experimento de Investigación (ID=2)** ← usado aquí
   - Demostración (ID=3)

---

## **🎯 Próximos Pasos Sugeridos**

1. **Pantalla del instructor:** Tu compañero puede crear pedidos manualmente
2. **Validación de stock:** Verificar disponibilidad antes de generar
3. **Historial:** Ver pedidos generados desde cada experimento
4. **Duplicar experimentos:** Permitir clonar experimentos existentes
5. **Categorías de experimentos:** Agrupar por tipo (orgánica, inorgánica, etc.)

---

## **✅ Estado: COMPLETAMENTE FUNCIONAL** 🎉

El sistema está listo para usar. Los usuarios pueden:
- Ver experimentos paginados
- Generar pedidos automáticamente
- Configurar número de grupos
- Ver pedido creado inmediatamente

# 🔄 Flujo Completo de Estados - Sistema Kalium

## 📋 Resumen Ejecutivo

Este documento explica el ciclo de vida completo de pedidos, insumos y entregas.

---

## 🎯 Flujo Completo: Del Pedido a la Devolución

```
┌─────────────────────────────────────────────────────────────────┐
│                      CICLO DE VIDA COMPLETO                     │
└─────────────────────────────────────────────────────────────────┘

1️⃣ CREAR PEDIDO
   ├─ Pedido: Pendiente (ID=1)
   ├─ PedidoDetalle: Pendiente (ID=1)
   └─ Insumos: Disponible (ID=1)

            ↓ [Aprobar Pedido]

2️⃣ PEDIDO APROBADO
   ├─ Pedido: Aprobado (ID=2)
   ├─ PedidoDetalle: Reservado (ID=2)
   └─ Insumos: Reservado (ID=5) ✅ Apartados para el pedido

            ↓ [Generar Entregas]

3️⃣ ENTREGAS GENERADAS
   ├─ Pedido: Entregado (ID=4)
   ├─ PedidoDetalle: Entregado (ID=3)
   ├─ Insumos: En Uso (ID=2) ✅ Asignados a entregas
   ├─ N entregas creadas (N = cantGrupos)
   └─ EntregaInsumo: Relación creada automáticamente

            ↓ [Asignar Estudiantes]

4️⃣ ESTUDIANTES ASIGNADOS
   └─ Entrega.estudiante: Asignado ✅

            ↓ [Devolución]

5️⃣ DEVOLUCIÓN REALIZADA
   ├─ Devolucion: Creada
   ├─ DevolucionDetalle: Insumos devueltos
   └─ Insumos: Disponible (ID=1) ✅ Liberados para nuevo uso
```

---

## 📊 Tabla de Estados por Entidad

### **1. EstPedido**

| ID | Nombre | Descripción | Siguiente Estado |
|----|--------|-------------|------------------|
| 1 | Pendiente | Pedido creado, esperando aprobación | Aprobado (2) o Rechazado (5) |
| 2 | Aprobado | Listo para preparar | En Preparación (3) |
| 3 | En Preparación | Insumos siendo preparados | Entregado (4) |
| 4 | Entregado | Entregas generadas y asignadas | - |
| 5 | Rechazado | Pedido no aprobado | - |

### **2. EstPedidoDetalle**

| ID | Nombre | Descripción | Trigger |
|----|--------|-------------|---------|
| 1 | Pendiente | Detalle sin procesar | Pedido creado |
| 2 | Reservado | Insumos apartados | Pedido aprobado |
| 3 | Entregado | Insumos en entregas | Entregas generadas |
| 4 | Cancelado | Pedido cancelado | Pedido rechazado |

### **3. EstInsumo**

| ID | Nombre | Descripción | Transiciones |
|----|--------|-------------|--------------|
| 1 | Disponible | Listo para usar | → Reservado (5) |
| 2 | En Uso | En una entrega activa | → Disponible (1) o Agotado (3) |
| 3 | Agotado | Dañado/Perdido | - |
| 4 | En Mantenimiento | En reparación | → Disponible (1) |
| 5 | Reservado | Apartado para pedido | → En Uso (2) |

---

## 🔧 Métodos del Sistema

### **PedidoService.aprobarPedido()**

**Input:** `idPedido`

**Proceso:**
```java
1. Cambiar Pedido.estado → Aprobado (2)
2. Para cada PedidoDetalle:
   - Cambiar estado → Reservado (2)
3. Para cada TipoInsumo en el pedido:
   - Buscar insumos Disponibles (1)
   - Cambiar N insumos → Reservado (5)
   - N = cantInsumo × cantGrupos
```

**Output:** Insumos reservados ✅

---

### **EntregaService.generarEntregasPorGrupos()**

**Input:** `idPedido`

**Proceso:**
```java
1. Validar pedido esté Aprobado (2) o En Preparación (3)
2. Obtener insumos Reservados (5) del pedido
3. Para i = 1 hasta cantGrupos:
   - Crear Entrega vacía
   - Para cada TipoInsumo del pedido:
     * Asignar N insumos a la entrega
     * Crear EntregaInsumo
     * Cambiar Insumo.estado → En Uso (2)
4. Cambiar PedidoDetalle.estado → Entregado (3)
5. Cambiar Pedido.estado → Entregado (4)
```

**Output:** 
- N entregas creadas
- Insumos En Uso ✅
- EntregaInsumo creados ✅

---

### **EntregaService.asignarEstudianteAEntrega()**

**Input:** `idEntrega`, `idEstudiante`

**Proceso:**
```java
1. Validar entrega y estudiante existen
2. Entrega.estudiante = estudiante
3. Guardar entrega
```

**Output:** Entrega con estudiante asignado ✅

---

### **DevolucionService.crearDevolucion()** *(Por implementar)*

**Input:** `idEntrega`, `listaInsumos`

**Proceso:**
```java
1. Crear Devolucion
2. Para cada insumo devuelto:
   - Crear DevolucionDetalle
   - Validar estado del insumo:
     * Si OK → Cambiar a Disponible (1)
     * Si Dañado → Cambiar a Agotado (3)
   - Eliminar EntregaInsumo
```

**Output:** 
- Devolución registrada
- Insumos liberados ✅

---

## 🎨 Ejemplo Visual Completo

### **Pedido #5: Química Orgánica, 3 Grupos**

#### **Detalles del Pedido:**
- 2 Balanzas por grupo = **6 balanzas total**
- 1 Probeta por grupo = **3 probetas total**

---

#### **📍 Estado 1: Pedido Creado**

```
Pedido #5
├─ Estado: Pendiente (1)
├─ Grupos: 3
└─ Detalles:
   ├─ 2 Balanzas (Pendiente)
   └─ 1 Probeta (Pendiente)

Base de Datos - Insumo:
┌─────┬──────────┬─────────────┐
│ ID  │ Tipo     │ Estado      │
├─────┼──────────┼─────────────┤
│ 1   │ Balanza  │ Disponible  │
│ 2   │ Balanza  │ Disponible  │
│ 3   │ Balanza  │ Disponible  │
│ 4   │ Balanza  │ Disponible  │
│ 5   │ Balanza  │ Disponible  │
│ 6   │ Balanza  │ Disponible  │
│ 7   │ Probeta  │ Disponible  │
│ 8   │ Probeta  │ Disponible  │
│ 9   │ Probeta  │ Disponible  │
└─────┴──────────┴─────────────┘
```

---

#### **📍 Estado 2: Pedido Aprobado**

```
Pedido #5
├─ Estado: Aprobado (2) ✅
├─ Grupos: 3
└─ Detalles:
   ├─ 2 Balanzas (Reservado) ✅
   └─ 1 Probeta (Reservado) ✅

Base de Datos - Insumo:
┌─────┬──────────┬─────────────┐
│ ID  │ Tipo     │ Estado      │
├─────┼──────────┼─────────────┤
│ 1   │ Balanza  │ Reservado   │ ✅ Para grupo 1
│ 2   │ Balanza  │ Reservado   │ ✅ Para grupo 1
│ 3   │ Balanza  │ Reservado   │ ✅ Para grupo 2
│ 4   │ Balanza  │ Reservado   │ ✅ Para grupo 2
│ 5   │ Balanza  │ Reservado   │ ✅ Para grupo 3
│ 6   │ Balanza  │ Reservado   │ ✅ Para grupo 3
│ 7   │ Probeta  │ Reservado   │ ✅ Para grupo 1
│ 8   │ Probeta  │ Reservado   │ ✅ Para grupo 2
│ 9   │ Probeta  │ Reservado   │ ✅ Para grupo 3
└─────┴──────────┴─────────────┘
```

---

#### **📍 Estado 3: Entregas Generadas**

```
Pedido #5
├─ Estado: Entregado (4) ✅
├─ Grupos: 3
└─ Entregas:
   ├─ Entrega #15
   │  ├─ Estudiante: Pendiente
   │  └─ Insumos:
   │     ├─ Balanza #1 (En Uso) ✅
   │     ├─ Balanza #2 (En Uso) ✅
   │     └─ Probeta #7 (En Uso) ✅
   │
   ├─ Entrega #16
   │  ├─ Estudiante: Pendiente
   │  └─ Insumos:
   │     ├─ Balanza #3 (En Uso) ✅
   │     ├─ Balanza #4 (En Uso) ✅
   │     └─ Probeta #8 (En Uso) ✅
   │
   └─ Entrega #17
      ├─ Estudiante: Pendiente
      └─ Insumos:
         ├─ Balanza #5 (En Uso) ✅
         ├─ Balanza #6 (En Uso) ✅
         └─ Probeta #9 (En Uso) ✅

Base de Datos - EntregaInsumo:
┌─────────────┬──────────┬──────────┐
│ IDEntrega   │ IDInsumo │ Estado   │
├─────────────┼──────────┼──────────┤
│ 15          │ 1        │ En Uso   │
│ 15          │ 2        │ En Uso   │
│ 15          │ 7        │ En Uso   │
│ 16          │ 3        │ En Uso   │
│ 16          │ 4        │ En Uso   │
│ 16          │ 8        │ En Uso   │
│ 17          │ 5        │ En Uso   │
│ 17          │ 6        │ En Uso   │
│ 17          │ 9        │ En Uso   │
└─────────────┴──────────┴──────────┘
```

---

#### **📍 Estado 4: Estudiantes Asignados**

```
Entrega #15 → Pedro Ramírez
Entrega #16 → Laura Torres
Entrega #17 → Miguel Fernández
```

---

#### **📍 Estado 5: Devolución Realizada**

```
Devolucion #1
├─ Entrega: #15
├─ Fecha: 2025-01-20
└─ Insumos devueltos:
   ├─ Balanza #1 → Disponible ✅
   ├─ Balanza #2 → Agotado (Dañada) ❌
   └─ Probeta #7 → Disponible ✅

Base de Datos - Insumo (Después):
┌─────┬──────────┬─────────────┐
│ ID  │ Tipo     │ Estado      │
├─────┼──────────┼─────────────┤
│ 1   │ Balanza  │ Disponible  │ ✅ Devuelta OK
│ 2   │ Balanza  │ Agotado     │ ❌ Dañada
│ 7   │ Probeta  │ Disponible  │ ✅ Devuelta OK
│ 3-6 │ ...      │ En Uso      │ Aún en otras entregas
│ 8-9 │ ...      │ En Uso      │ Aún en otras entregas
└─────┴──────────┴─────────────┘
```

---

## ✅ Checklist de Implementación

### **Completados:**
- [x] EstPedido y transiciones
- [x] EstPedidoDetalle y transiciones
- [x] EstInsumo (5 estados)
- [x] PedidoService.aprobarPedido() → Reserva insumos
- [x] EntregaService.generarEntregasPorGrupos() → Cambia a "En Uso"
- [x] EntregaService.guardarEntregaInsumo() → Cambia a "En Uso"
- [x] EntregaService.eliminarEntregaInsumo() → Cambia a "Disponible"
- [x] EntregaService.asignarEstudianteAEntrega()

### **Pendientes:**
- [ ] DevolucionService.crearDevolucion()
- [ ] DevolucionService.registrarInsumoDevuelto()
- [ ] Validación de insumos dañados
- [ ] Historial de cambios de estado

---

## 🎯 Próximo Paso: Sistema de Devoluciones

El siguiente módulo a implementar es:

```
DevolucionService
├─ crearDevolucion(idEntrega)
├─ agregarInsumoDevuelto(idDevolucion, idInsumo, estadoInsumo)
├─ finalizarDevolucion(idDevolucion)
└─ obtenerDevolucionesPorEstudiante(idEstudiante)
```

**Flujo de Devolución:**
1. Estudiante entrega insumos
2. Laboratorista revisa estado de cada insumo
3. Insumos OK → Estado "Disponible"
4. Insumos dañados → Estado "Agotado"
5. Se registra la devolución completa
6. Los insumos disponibles pueden ser reservados para nuevos pedidos

---

✅ **Sistema de estados completado y documentado**

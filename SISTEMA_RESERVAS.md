# 🔄 Sistema de Reservas Híbrida - Kalium

## 📋 Descripción

Sistema simplificado de reservas que permite reservar insumos al aprobar pedidos y liberarlos automáticamente si el pedido vence o se cancela.

---

## 🏗️ Arquitectura

### **Base de Datos:**

#### 1. **Nueva Tabla: `EstPedidoDetalle`**
Estados de los detalles de pedido:
- `1 - Pendiente`: Pedido creado pero no aprobado
- `2 - Reservado`: Pedido aprobado, insumos reservados
- `3 - Entregado`: Ya fue entregado
- `4 - Cancelado`: Cancelado o vencido

#### 2. **Tabla `PedidoDetalle` modificada:**
- Agregado campo: `IDEstPedidoDetalle` (FK a EstPedidoDetalle)

#### 3. **Tabla `EstInsumo` actualizada:**
Agregado nuevo estado:
- `5 - Reservado`: Insumo físico reservado para un pedido

---

## 🔄 Flujo Completo

### **1. Crear Pedido (Estado: Pendiente)**
```
Usuario crea pedido
  ↓
PedidoDetalle.estado = "Pendiente"
  ↓
Insumos NO se reservan aún
```

### **2. Aprobar Pedido (Estado: Aprobado)**

#### **Para Insumos Físicos:**
```
Admin aprueba pedido
  ↓
Buscar N insumos "Disponibles" del tipo solicitado
  ↓
Cambiar su estado a "Reservado"
  ↓
PedidoDetalle.estado = "Reservado"
```

#### **Para Químicos:**
```
Admin aprueba pedido
  ↓
NO se resta cantidad física aún
  ↓
PedidoDetalle.estado = "Reservado"
  ↓
Stock disponible = Cantidad Total - SUM(cantidades reservadas)
```

### **3. Cancelar/Rechazar Pedido**
```
Sistema detecta vencimiento o admin rechaza
  ↓
Insumos físicos "Reservados" → vuelven a "Disponible"
  ↓
Químicos reservados: solo cambia estado del detalle
  ↓
PedidoDetalle.estado = "Cancelado"
```

### **4. Auto-cancelación de Pedidos Vencidos**
```
Job ejecuta cada hora
  ↓
Busca pedidos aprobados cuya fecha de entrega pasó
  ↓
Ejecuta cancelarPedido() para cada uno
  ↓
Libera reservas automáticamente
```

---

## 💻 Archivos Backend Creados/Modificados

### **Nuevos:**
1. ✅ `EstPedidoDetalle.java` - Entity para estados de detalle
2. ✅ `EstPedidoDetalleRepository.java` - Repositorio
3. ✅ `ReservaService.java` - Lógica de reservas y auto-cancelación

### **Modificados:**
1. ✅ `PedidoDetalle.java` - Agregado campo `estPedidoDetalle`
2. ✅ `InsumoRepository.java` - Agregados métodos:
   - `findByTipoInsumoAndEstInsumo()` - Buscar disponibles
   - `findReservadosByTipoInsumo()` - Buscar reservados
3. ✅ `PedidoRepository.java` - Agregado método:
   - `findPedidosAprobadosVencidos()` - Para auto-cancelación
4. ✅ `PedidoService.java` - Integrado con `ReservaService`
5. ✅ `KaliumApplication.java` - Habilitado `@EnableScheduling`

---

## 🌐 Archivos Frontend Modificados

1. ✅ `NuevoPedido.jsx` - Envía `estPedidoDetalle` al crear detalle

---

## 📊 Base de Datos

### **Migración:**
Ejecutar: `database/migracion_sistema_reservas.sql`

### **Datos de Prueba:**
Ejecutar: `database/datos_prueba_actualizado.sql`

---

## 🚀 Cómo Usar

### **1. Aplicar Migración (Solo una vez):**
```sql
USE kaliumdb;
SOURCE database/migracion_sistema_reservas.sql;
```

### **2. Compilar Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### **3. Frontend:**
```bash
cd frontend/frontend-kalium
npm run dev
```

---

## 📝 Métodos del ReservaService

### **`aprobarPedido(Integer idPedido)`**
- Cambia estado del pedido a "Aprobado"
- Reserva insumos físicos (cambia su estado a "Reservado")
- Marca químicos como reservados (sin restar cantidad)
- **Lanza excepción** si no hay suficiente stock

### **`cancelarPedido(Integer idPedido)`**
- Cambia estado del pedido a "Cancelado"
- Libera insumos físicos (vuelve a "Disponible")
- Libera químicos (solo cambia estado del detalle)

### **`cancelarPedidosVencidos()` (Job Programado)**
- Se ejecuta cada hora (`@Scheduled(cron = "0 0 * * * *")`)
- Busca pedidos aprobados con fecha de entrega pasada
- Ejecuta `cancelarPedido()` automáticamente

---

## 📈 Cálculo de Stock

### **Insumos Físicos:**
```sql
-- Stock Disponible
SELECT COUNT(*) 
FROM Insumo 
WHERE IDTipoInsumo = X 
  AND IDEstInsumo = 1; -- Disponible

-- Stock Reservado
SELECT COUNT(*) 
FROM Insumo 
WHERE IDTipoInsumo = X 
  AND IDEstInsumo = 5; -- Reservado
```

### **Químicos:**
```sql
-- Stock Total
SELECT SUM(CantQuimico) 
FROM Quimico 
WHERE IDTipoInsumo = X;

-- Stock Reservado
SELECT SUM(pd.CantInsumo)
FROM PedidoDetalle pd
WHERE pd.IDTipoInsumo = X
  AND pd.IDEstPedidoDetalle = 2; -- Reservado

-- Stock Disponible = Stock Total - Stock Reservado
```

---

## 🧪 Pruebas

### **1. Aprobar Pedido:**
```
POST /api/pedidos/1/estado/2
```
Verifica que los insumos se reserven.

### **2. Cancelar Pedido:**
```
POST /api/pedidos/1/estado/5
```
Verifica que los insumos se liberen.

### **3. Job de Auto-cancelación:**
- Crear pedido con fecha de entrega en el pasado
- Esperar 1 hora o forzar ejecución manual
- Verificar que se canceló automáticamente

---

## ⚠️ Notas Importantes

1. **NO se usa tabla `ReservaInsumo`** - Sistema simplificado
2. **Auto-cancelación cada hora** - Configurable en `ReservaService`
3. **Químicos NO se restan** hasta la entrega real
4. **Insumos físicos** se rastrean por estado, no por pedido específico
5. **Stock considera reservas** al mostrar disponibilidad

---

## 🔮 Futuras Mejoras (Opcionales)

1. **Pantalla de Gestión de Entregas** - Marcar como entregado
2. **Notificaciones** cuando un pedido se auto-cancela
3. **Dashboard** de insumos reservados
4. **Historial** de cambios de estado
5. **Extensión de plazo** de entrega

---

## 📞 Soporte

Para dudas o problemas, revisar:
- Logs del backend: `ReservaService` tiene logging detallado
- Estados en BD: Verificar `EstPedidoDetalle` y `EstInsumo`
- Job de auto-cancelación: Revisar logs cada hora

---

**✅ Sistema implementado y funcional sin tabla ReservaInsumo**

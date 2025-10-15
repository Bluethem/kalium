# 🚀 WebSocket Notificaciones en Tiempo Real - IMPLEMENTACIÓN COMPLETA

## ✅ RESUMEN DE LO IMPLEMENTADO

### **Backend (Spring Boot):**
1. ✅ **WebSocketConfig.java** - Configuración STOMP con SockJS
2. ✅ **NotificacionWebSocketService.java** - Servicio para enviar notificaciones
3. ✅ **NotificacionService.java** - Modificado para enviar por WebSocket
4. ✅ **pom.xml** - Agregada dependencia spring-boot-starter-websocket

### **Frontend (React):**
1. ✅ **websocket.js** - Servicio cliente WebSocket con STOMP
2. ✅ **Toast.jsx** - Componente de notificaciones emergentes
3. ✅ **Header.jsx** - Integrado WebSocket + Toasts
4. ✅ **index.css** - Agregadas animaciones

---

## 📦 PASO 1: Instalar Dependencias de Frontend

Abre una terminal en `frontend/frontend-kalium` y ejecuta:

```bash
npm install sockjs-client @stomp/stompjs
```

---

## 🔄 PASO 2: Reiniciar el Backend

1. Detén el servidor Spring Boot (si está corriendo)
2. Limpia y compila:
```bash
cd backend
mvn clean install
```
3. Inicia el servidor:
```bash
mvn spring-boot:run
```

El backend debe mostrar en consola:
```
✅ Servidor corriendo en http://localhost:8080
✅ WebSocket endpoint disponible en: ws://localhost:8080/ws
```

---

## 🔄 PASO 3: Reiniciar el Frontend

1. Detén el servidor Vite (si está corriendo)
2. Inicia de nuevo:
```bash
cd frontend/frontend-kalium
npm run dev
```

El frontend debe mostrar:
```
✅ Servidor corriendo en http://localhost:5173
```

---

## 🧪 PASO 4: Probar la Conexión

### **Test 1: Conexión al Iniciar Sesión**

1. Abre el navegador en `http://localhost:5173`
2. Inicia sesión
3. **Verifica en la consola del navegador (F12)**:
   ```
   🔌 Intentando conectar WebSocket para usuario: 1
   🔵 STOMP: Connected to: ws://localhost:8080/ws
   ✅ WebSocket conectado exitosamente
   ✅ Suscrito a: /topic/notificaciones/1
   ✅ Suscrito a: /topic/contador/1
   ```

4. **Verifica visualmente**:
   - Debe aparecer un **toast verde** arriba a la derecha: "✅ Conectado - Notificaciones en tiempo real activadas"
   - En el header, junto al botón de notificaciones, debe aparecer un **indicador "En vivo"** con ícono de WiFi parpadeando

5. **Verifica en la consola del backend**:
   ```
   ✅ Cliente WebSocket conectado
   ✅ Suscripción creada: /topic/notificaciones/1
   ```

---

### **Test 2: Crear Notificación de Stock Bajo**

**Opción A: Desde la API**

Abre Postman o usa curl:

```bash
POST http://localhost:8080/api/notificaciones/verificar-stock

# Respuesta esperada:
{
  "mensaje": "Verificación completada",
  "notificacionesCreadas": 2
}
```

**Opción B: Desde el código**

Puedes llamar manualmente al servicio o esperar a que se cree una notificación automática (cuando stock baje del mínimo).

**Qué debe pasar:**

1. **En la consola del backend:**
   ```
   ✅ Notificación guardada en BD
   ✅ Notificación enviada por WebSocket a usuario: 1
   ✅ Contador actualizado por WebSocket para usuario: 1 - Contador: 3
   ```

2. **En el frontend (navegador):**
   - **Toast azul aparece** arriba a la derecha:
     ```
     🔔 Stock bajo: Ácido Clorhídrico
     Stock bajo: Ácido Clorhídrico - Actual: 5.00 L / Mínimo: 10 L
     ```
   
   - **Badge de notificaciones actualizado** (se incrementa el número en rojo)
   
   - **En consola del navegador:**
     ```
     📬 Nueva notificación recibida: {...}
     🔢 Contador actualizado: 3
     ```

---

### **Test 3: Marcar como Leída**

1. Haz clic en el **ícono de campana** (notificaciones)
2. Aparece el panel desplegable con la notificación
3. Haz clic en **"Marcar como leída"**

**Qué debe pasar:**

1. **Backend envía por WebSocket:**
   ```
   ✅ Contador actualizado por WebSocket para usuario: 1 - Contador: 2
   ```

2. **Frontend recibe:**
   ```
   🔢 Contador actualizado: 2
   ```

3. **Badge se actualiza** automáticamente (disminuye el número)

---

### **Test 4: Marcar Todas como Leídas**

1. En el panel de notificaciones, haz clic en **"Marcar todas como leídas"**

**Qué debe pasar:**

1. **Backend:**
   ```
   ✅ Contador actualizado por WebSocket - Contador: 0
   ```

2. **Frontend:**
   - Badge desaparece (contador = 0)
   - Panel se actualiza
   ```
   🔢 Contador actualizado: 0
   ```

---

## 🎨 CARACTERÍSTICAS IMPLEMENTADAS

### **1. Notificaciones en Tiempo Real** 🔔
- ✅ Toast emergente cuando llega notificación
- ✅ Título y mensaje personalizados
- ✅ Ícono según tipo de notificación
- ✅ Animación suave (slide-in desde la derecha)
- ✅ Auto-cierre después de 5 segundos
- ✅ Botón de cerrar manual

### **2. Actualización Automática de Contador** 🔢
- ✅ Badge actualizado en tiempo real
- ✅ Sin necesidad de recargar página
- ✅ Animación pulse en el badge

### **3. Indicador de Conexión** 📡
- ✅ Ícono "En vivo" visible cuando conectado
- ✅ Animación pulse en ícono WiFi
- ✅ Se oculta cuando desconecta

### **4. Sonido de Notificación** 🔊
- ✅ Reproduce sonido cuando llega notificación
- ✅ Volumen controlado (30%)
- ✅ No falla si no hay archivo de audio

### **5. Reconexión Automática** ♻️
- ✅ Reintenta cada 5 segundos si pierde conexión
- ✅ Heartbeat cada 4 segundos
- ✅ Fallback a SockJS polling si WebSocket falla

### **6. Múltiples Tipos de Notificaciones** 📬
- ✅ BAJO_STOCK (amarillo con warning)
- ✅ PEDIDO_PENDIENTE (azul con clock)
- ✅ PEDIDO_APROBADO (verde con check)
- ✅ INCIDENTE (rojo con error)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema 1: No conecta WebSocket**

**Síntomas:**
- No aparece toast de "Conectado"
- No hay indicador "En vivo"
- Consola muestra error de conexión

**Soluciones:**
1. Verifica que el backend esté corriendo en puerto 8080
2. Verifica CORS en `WebSocketConfig.java`:
   ```java
   .setAllowedOriginPatterns("*")
   ```
3. Verifica que el endpoint sea correcto:
   ```javascript
   const socket = new SockJS('http://localhost:8080/ws');
   ```

---

### **Problema 2: No llegan notificaciones**

**Síntomas:**
- WebSocket conectado
- Se crean notificaciones en BD
- Pero no aparece toast

**Soluciones:**
1. Verifica en consola del backend:
   ```
   ✅ Notificación enviada por WebSocket a usuario: X
   ```
2. Verifica topic correcto:
   ```javascript
   `/topic/notificaciones/${userId}`
   ```
3. Verifica que `userId` sea correcto en Header

---

### **Problema 3: Contador no se actualiza**

**Síntomas:**
- Badge no cambia automáticamente
- Hay que recargar para ver cambios

**Soluciones:**
1. Verifica suscripción a contador:
   ```
   ✅ Suscrito a: /topic/contador/1
   ```
2. Verifica callback en Header:
   ```javascript
   onContadorActualizado: (nuevoContador) => {
     setContadorNoLeidas(nuevoContador);
   }
   ```

---

## 📊 FLUJO COMPLETO

```
[Usuario inicia sesión]
        ↓
[Header detecta userId]
        ↓
[WebSocket.connect(userId)]
        ↓
[SockJS crea conexión a /ws]
        ↓
[STOMP activa cliente]
        ↓
[Suscribe a /topic/notificaciones/{userId}]
[Suscribe a /topic/contador/{userId}]
        ↓
[✅ Conexión establecida]
        ↓
[Backend detecta stock bajo]
        ↓
[NotificacionService.crearNotificacionBajoStock()]
        ↓
[Guarda en BD]
        ↓
[WebSocketService.enviarNotificacionAUsuario()]
        ↓
[STOMP envía mensaje a /topic/notificaciones/1]
        ↓
[Frontend recibe mensaje]
        ↓
[onNotificacion callback ejecutado]
        ↓
[Muestra Toast + Actualiza contador + Reproduce sonido]
```

---

## 🎉 ¡LISTO!

**Si ves esto, WebSocket está funcionando:**
- ✅ Toast de "Conectado" al iniciar sesión
- ✅ Indicador "En vivo" en header
- ✅ Toast cuando llega nueva notificación
- ✅ Badge se actualiza sin recargar
- ✅ Consola muestra mensajes de conexión

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

1. **Agregar sonido real**
   - Descarga un archivo `notification.mp3`
   - Colócalo en `frontend-kalium/public/`

2. **Notificaciones del navegador**
   ```javascript
   if (Notification.permission === 'granted') {
     new Notification('Kalium', {
       body: notificacion.mensaje,
       icon: '/logo.png'
     });
   }
   ```

3. **Persistir conexión en tabs múltiples**
   - Usar BroadcastChannel API
   - Compartir estado de notificaciones entre tabs

4. **Dashboard de métricas**
   - Gráfico de notificaciones en tiempo real
   - Contador de usuarios conectados
   - Log de actividad

---

## 📞 ¿PROBLEMAS?

Si algo no funciona:
1. Revisa consola del navegador (F12)
2. Revisa logs del backend (Spring Boot)
3. Verifica que ambos servidores estén corriendo
4. Verifica puertos: Backend (8080), Frontend (5173)

¡Todo debería funcionar! 🎊

# 📬 Análisis del Módulo de Notificaciones

## ✅ **Estado Actual - LO QUE FUNCIONA:**

### **Frontend:**
1. ✅ **ListaNotificaciones.jsx** - Página completa
   - Tabs (Todas / No leídas)
   - Filtro por tipo (Bajo Stock, Pedidos, Incidentes)
   - Paginación profesional
   - Marcar como leída
   - Eliminar notificaciones
   - Limpiar leídas
   - Formato de fecha relativa

2. ✅ **NotificacionPanel.jsx** - Dropdown en Header
   - Panel desplegable con notificaciones recientes
   - Resumen con badges (stock bajo, pedidos, incidentes)
   - Acciones rápidas (marcar leída, eliminar)
   - Actualiza contador en header correctamente

3. ✅ **API Service completo**
   - Todos los endpoints conectados
   - CRUD de notificaciones
   - Contador de no leídas
   - Resumen por tipo

### **Backend (Spring Boot):**
- ✅ Endpoints REST funcionando
- ✅ Base de datos con tabla de notificaciones
- ✅ Lógica de negocio para crear/leer/eliminar

---

## ❌ **LO QUE FALTA - NOTIFICACIONES EN TIEMPO REAL**

### **Problema Actual:**
- 🔴 **Polling manual**: Debe recargar manualmente para ver nuevas notificaciones
- 🔴 **No hay WebSocket**: Sin conexión persistente
- 🔴 **Sin actualizaciones automáticas**: El usuario no se entera de nuevas alertas

### **Solución: Implementar WebSocket con STOMP**

---

## 🚀 **PLAN DE IMPLEMENTACIÓN - Notificaciones en Tiempo Real**

### **Tecnologías:**
- **Backend**: Spring WebSocket + STOMP
- **Frontend**: SockJS + STOMP Client

---

## 📦 **Paso 1: Backend - Configurar WebSocket**

### **1.1 Dependencias Maven (backend/pom.xml)**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### **1.2 Configuración WebSocket**
**Archivo:** `backend/src/main/java/com/kalium/config/WebSocketConfig.java`

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

### **1.3 Servicio de Notificaciones WebSocket**
**Archivo:** `backend/src/main/java/com/kalium/service/NotificacionWebSocketService.java`

```java
@Service
public class NotificacionWebSocketService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // Enviar notificación a un usuario específico
    public void enviarNotificacionAUsuario(Long idUsuario, NotificacionDTO notificacion) {
        messagingTemplate.convertAndSend(
            "/topic/notificaciones/" + idUsuario, 
            notificacion
        );
    }
    
    // Enviar notificación a todos
    public void enviarNotificacionGlobal(NotificacionDTO notificacion) {
        messagingTemplate.convertAndSend("/topic/notificaciones/global", notificacion);
    }
    
    // Enviar actualización de contador
    public void enviarActualizacionContador(Long idUsuario, int contador) {
        Map<String, Object> mensaje = new HashMap<>();
        mensaje.put("contador", contador);
        mensaje.put("timestamp", LocalDateTime.now());
        
        messagingTemplate.convertAndSend(
            "/topic/contador/" + idUsuario, 
            mensaje
        );
    }
}
```

### **1.4 Modificar NotificacionService para enviar por WebSocket**
**Archivo:** `backend/src/main/java/com/kalium/service/NotificacionService.java`

```java
@Service
public class NotificacionService {
    
    @Autowired
    private NotificacionRepository notificacionRepository;
    
    @Autowired
    private NotificacionWebSocketService webSocketService;
    
    public Notificacion crearNotificacion(NotificacionDTO dto) {
        // Guardar en BD
        Notificacion notificacion = new Notificacion();
        // ... mapear campos ...
        notificacion = notificacionRepository.save(notificacion);
        
        // ✅ NUEVO: Enviar por WebSocket en tiempo real
        NotificacionDTO notifDTO = convertirADTO(notificacion);
        webSocketService.enviarNotificacionAUsuario(
            notificacion.getUsuario().getIdUsuario(), 
            notifDTO
        );
        
        // ✅ Actualizar contador
        int contador = contarNoLeidasPorUsuario(notificacion.getUsuario().getIdUsuario());
        webSocketService.enviarActualizacionContador(
            notificacion.getUsuario().getIdUsuario(), 
            contador
        );
        
        return notificacion;
    }
}
```

---

## 🎨 **Paso 2: Frontend - Conectar WebSocket**

### **2.1 Instalar Dependencias**
```bash
cd frontend/frontend-kalium
npm install sockjs-client @stomp/stompjs
```

### **2.2 Crear Servicio WebSocket**
**Archivo:** `src/services/websocket.js`

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(userId, callbacks = {}) {
    if (this.connected) {
      console.log('WebSocket ya está conectado');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      
      onConnect: () => {
        console.log('✅ WebSocket conectado');
        this.connected = true;
        
        if (callbacks.onConnect) callbacks.onConnect();

        // Suscribirse a notificaciones del usuario
        this.subscribeToUserNotifications(userId, callbacks.onNotificacion);
        
        // Suscribirse a actualizaciones de contador
        this.subscribeToCounter(userId, callbacks.onContadorActualizado);
      },

      onDisconnect: () => {
        console.log('❌ WebSocket desconectado');
        this.connected = false;
        if (callbacks.onDisconnect) callbacks.onDisconnect();
      },

      onStompError: (frame) => {
        console.error('❌ Error STOMP:', frame);
        if (callbacks.onError) callbacks.onError(frame);
      }
    });

    this.client.activate();
  }

  subscribeToUserNotifications(userId, callback) {
    if (!this.client || !this.connected) return;

    const subscription = this.client.subscribe(
      `/topic/notificaciones/${userId}`,
      (message) => {
        const notificacion = JSON.parse(message.body);
        console.log('📬 Nueva notificación:', notificacion);
        if (callback) callback(notificacion);
      }
    );

    this.subscriptions.set('notificaciones', subscription);
  }

  subscribeToCounter(userId, callback) {
    if (!this.client || !this.connected) return;

    const subscription = this.client.subscribe(
      `/topic/contador/${userId}`,
      (message) => {
        const data = JSON.parse(message.body);
        console.log('🔢 Contador actualizado:', data.contador);
        if (callback) callback(data.contador);
      }
    );

    this.subscriptions.set('contador', subscription);
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
      console.log('WebSocket desconectado manualmente');
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();
```

### **2.3 Integrar en Header.jsx**
**Modificar:** `src/components/Layout/Header.jsx`

```javascript
import { useEffect, useState } from 'react';
import websocketService from '../../services/websocket';
import { toast } from 'react-toastify'; // Para mostrar notificaciones toast

const Header = () => {
  const [contadorNotificaciones, setContadorNotificaciones] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const parsed = JSON.parse(usuario);
      const id = parsed?.idUsuario;
      setUserId(id);

      // ✅ Conectar WebSocket
      websocketService.connect(id, {
        onConnect: () => {
          console.log('✅ WebSocket conectado en Header');
        },
        
        onNotificacion: (notificacion) => {
          // Mostrar toast
          toast.info(notificacion.mensaje, {
            position: 'top-right',
            autoClose: 5000,
            icon: '🔔'
          });
          
          // Recargar contador
          cargarContadorNotificaciones();
        },
        
        onContadorActualizado: (nuevoContador) => {
          setContadorNotificaciones(nuevoContador);
        },
        
        onDisconnect: () => {
          console.log('❌ WebSocket desconectado');
        }
      });
    }

    // Cleanup al desmontar
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // ... resto del código del Header
};
```

---

## 🎯 **Características de Notificaciones en Tiempo Real**

### **Lo que se logrará:**
1. ✅ **Notificaciones instantáneas** cuando:
   - Stock de un insumo baja de umbral
   - Se crea un nuevo pedido
   - Se reporta un incidente
   - Un pedido es aprobado/rechazado

2. ✅ **Actualización automática del contador** en el badge del header

3. ✅ **Toast notifications** con sonido opcional

4. ✅ **Actualización automática** de la lista de notificaciones sin recargar

5. ✅ **Conexión persistente** que se reconecta automáticamente

---

## 📊 **Flujo Completo:**

```
[Evento en Backend]
    ↓
[NotificacionService.crearNotificacion()]
    ↓
[Guardar en BD]
    ↓
[WebSocketService.enviarNotificacionAUsuario()]
    ↓
[STOMP envía a /topic/notificaciones/{userId}]
    ↓
[Frontend recibe mensaje]
    ↓
[Muestra Toast + Actualiza Contador + Actualiza Lista]
```

---

## 🎨 **Mejoras Adicionales Sugeridas**

### **1. Sonido de notificación**
```javascript
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};
```

### **2. Icono parpadeante en el badge**
```css
@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.badge-new-notification {
  animation: pulse-badge 1s infinite;
}
```

### **3. Notificaciones del navegador (Web Notification API)**
```javascript
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Nueva notificación de Kalium', {
    body: notificacion.mensaje,
    icon: '/logo.png'
  });
}
```

---

## ⏱️ **Tiempo de Implementación Estimado**

- Backend (WebSocket): **30 min**
- Frontend (Conexión): **30 min**
- Integración + Pruebas: **30 min**
- **TOTAL: ~1.5 horas**

---

## 🚀 **¿Implementamos ahora?**

Podemos empezar con:
1. Backend primero (Spring WebSocket)
2. Frontend después (SockJS + STOMP)
3. Probar en tiempo real

¿Por dónde empezamos? 🔥

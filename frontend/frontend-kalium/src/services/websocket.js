import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import logger from '../utils/logger';

/**
 * Servicio para manejar conexiones WebSocket con STOMP
 * Permite recibir notificaciones en tiempo real desde el backend
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Conectar al servidor WebSocket
   * @param {number} userId - ID del usuario
   * @param {object} callbacks - Objeto con funciones callback
   */
  connect(userId, callbacks = {}) {
    if (this.connected) {
      logger.log('✅ WebSocket ya está conectado');
      return;
    }

    logger.log(`🔌 Intentando conectar WebSocket para usuario: ${userId}`);

    // Crear socket SockJS
    const socket = new SockJS('http://localhost:8080/ws');
    
    this.client = new Client({
      webSocketFactory: () => socket,
      
      debug: (str) => {
        logger.debug('🔵 STOMP:', str);
      },
      
      reconnectDelay: 5000, // Reintenta cada 5 segundos
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        logger.log('✅ WebSocket conectado exitosamente');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Callback de conexión exitosa
        if (callbacks.onConnect) {
          callbacks.onConnect();
        }

        // Suscribirse a notificaciones del usuario
        this.subscribeToUserNotifications(userId, callbacks.onNotificacion);
        
        // Suscribirse a actualizaciones de contador
        this.subscribeToCounter(userId, callbacks.onContadorActualizado);
      },

      onDisconnect: () => {
        logger.log('❌ WebSocket desconectado');
        this.connected = false;
        
        if (callbacks.onDisconnect) {
          callbacks.onDisconnect();
        }
      },

      onStompError: (frame) => {
        logger.error('❌ Error STOMP:', frame.headers['message']);
        logger.error('Detalles:', frame.body);
        
        if (callbacks.onError) {
          callbacks.onError(frame);
        }
      }
    });

    // Activar el cliente STOMP
    this.client.activate();
  }

  /**
   * Suscribirse a notificaciones de un usuario específico
   */
  subscribeToUserNotifications(userId, callback) {
    if (!this.client || !this.connected) {
      logger.warn('⚠️ No se puede suscribir: cliente no conectado');
      return;
    }

    const topic = `/topic/notificaciones/${userId}`;
    
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const notificacion = JSON.parse(message.body);
        logger.log('📬 Nueva notificación recibida:', notificacion);
        
        if (callback) {
          callback(notificacion);
        }
      } catch (error) {
        logger.error('Error al parsear notificación:', error);
      }
    });

    this.subscriptions.set('notificaciones', subscription);
    logger.log(`✅ Suscrito a: ${topic}`);
  }

  /**
   * Suscribirse a actualizaciones del contador de notificaciones
   */
  subscribeToCounter(userId, callback) {
    if (!this.client || !this.connected) {
      logger.warn('⚠️ No se puede suscribir: cliente no conectado');
      return;
    }

    const topic = `/topic/contador/${userId}`;
    
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        logger.log('🔢 Contador actualizado:', data.contador);
        
        if (callback) {
          callback(data.contador);
        }
      } catch (error) {
        logger.error('Error al parsear contador:', error);
      }
    });

    this.subscriptions.set('contador', subscription);
    logger.log(`✅ Suscrito a: ${topic}`);
  }

  /**
   * Desconectar WebSocket
   */
  disconnect() {
    if (this.client) {
      logger.log('🔌 Desconectando WebSocket...');
      
      // Cancelar todas las suscripciones
      this.subscriptions.forEach((subscription, key) => {
        subscription.unsubscribe();
        logger.log(`❌ Desuscrito de: ${key}`);
      });
      
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
      
      logger.log('✅ WebSocket desconectado correctamente');
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Obtener cliente STOMP (para uso avanzado)
   */
  getClient() {
    return this.client;
  }
}

// Exportar una única instancia (Singleton)
export default new WebSocketService();

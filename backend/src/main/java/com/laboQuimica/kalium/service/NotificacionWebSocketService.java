package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.dto.NotificacionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Servicio para enviar notificaciones en tiempo real a través de WebSocket
 */
@Service
public class NotificacionWebSocketService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificacionWebSocketService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Envía una notificación a un usuario específico en tiempo real
     * @param idUsuario ID del usuario destinatario
     * @param notificacion Objeto NotificacionDTO a enviar
     */
    public void enviarNotificacionAUsuario(Long idUsuario, NotificacionDTO notificacion) {
        try {
            // Envía a /topic/notificaciones/{idUsuario}
            messagingTemplate.convertAndSend(
                "/topic/notificaciones/" + idUsuario, 
                notificacion
            );
            logger.debug("Notificación enviada por WebSocket a usuario: {}", idUsuario);
        } catch (Exception e) {
            logger.error("Error al enviar notificación por WebSocket: {}", e.getMessage());
        }
    }
    
    /**
     * Envía una notificación global a todos los usuarios conectados
     * @param notificacion Objeto NotificacionDTO a enviar
     */
    public void enviarNotificacionGlobal(NotificacionDTO notificacion) {
        try {
            messagingTemplate.convertAndSend("/topic/notificaciones/global", notificacion);
            logger.debug("Notificación global enviada por WebSocket");
        } catch (Exception e) {
            logger.error("Error al enviar notificación global: {}", e.getMessage());
        }
    }
    
    /**
     * Envía actualización del contador de notificaciones no leídas a un usuario
     * @param idUsuario ID del usuario
     * @param contador Número de notificaciones no leídas
     */
    public void enviarActualizacionContador(Long idUsuario, Integer contador) {
        try {
            Map<String, Object> mensaje = new HashMap<>();
            mensaje.put("contador", contador);
            mensaje.put("timestamp", LocalDateTime.now().toString());
            
            // Envía a /topic/contador/{idUsuario}
            messagingTemplate.convertAndSend(
                "/topic/contador/" + idUsuario, 
                mensaje
            );
            logger.debug("Contador actualizado por WebSocket para usuario: {} - Contador: {}", idUsuario, contador);
        } catch (Exception e) {
            logger.error("Error al enviar actualización de contador: {}", e.getMessage());
        }
    }
    
    /**
     * Envía un evento de test de conexión a un usuario
     * @param idUsuario ID del usuario
     */
    public void enviarTestConexion(Long idUsuario) {
        try {
            Map<String, Object> mensaje = new HashMap<>();
            mensaje.put("tipo", "TEST");
            mensaje.put("mensaje", "Conexión WebSocket establecida correctamente");
            mensaje.put("timestamp", LocalDateTime.now().toString());
            
            messagingTemplate.convertAndSend(
                "/topic/notificaciones/" + idUsuario, 
                mensaje
            );
            logger.debug("Test de conexión enviado a usuario: {}", idUsuario);
        } catch (Exception e) {
            logger.error("Error al enviar test de conexión: {}", e.getMessage());
        }
    }
}

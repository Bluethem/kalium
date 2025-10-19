package com.laboQuimica.kalium.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración de WebSocket para notificaciones en tiempo real
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita un broker simple en memoria para enviar mensajes a los clientes
        // /topic - para mensajes broadcast (uno a muchos)
        // /queue - para mensajes punto a punto (uno a uno)
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefijo para mensajes que vienen desde el cliente
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra el endpoint "/ws" para conexión WebSocket
        // withSockJS() permite fallback a polling si WebSocket no está disponible
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permite CORS desde cualquier origen
                .withSockJS(); // Habilita SockJS como fallback
    }
}

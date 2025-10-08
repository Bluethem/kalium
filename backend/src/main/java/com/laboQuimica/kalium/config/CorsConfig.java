package com.laboQuimica.kalium.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ✅ Permitir el origen del frontend
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // ✅ IMPORTANTE: Agregar PATCH a los métodos permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", 
            "POST", 
            "PUT", 
            "PATCH",  // ← ESTO FALTABA
            "DELETE", 
            "OPTIONS"
        ));
        
        // ✅ Permitir headers necesarios
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
        ));
        
        // ✅ Permitir credenciales
        configuration.setAllowCredentials(true);
        
        // ✅ Configurar tiempo de caché para preflight
        configuration.setMaxAge(3600L);
        
        // ✅ Aplicar configuración a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
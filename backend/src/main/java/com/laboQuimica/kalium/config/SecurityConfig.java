package com.laboQuimica.kalium.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Permite todas las peticiones sin autenticación
            )
            .csrf(csrf -> csrf.disable()) // Deshabilita CSRF para API REST
            .cors(cors -> {}); // Usa la configuración CORS de CorsConfig
        
        return http.build();
    }
}
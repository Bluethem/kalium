package com.laboQuimica.kalium.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiService {
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(GeminiService.class);
    
    // Permite usar GEMINI_API_KEY (recomendado por la guía) y hace fallback a GOOGLE_AI_API_KEY
    @Value("${GEMINI_API_KEY:${GOOGLE_AI_API_KEY:}}")
    private String apiKey;

    // Modelo configurable, default recomendado por la guía actual
    @Value("${GEMINI_MODEL:gemini-2.5-flash}")
    private String model;

    // Endpoint base v1, construiremos la URL con el modelo configurado
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1/models/%s:generateContent";
    private final RestTemplate restTemplate = new RestTemplate();

    public String generateResponse(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("La API key de Google AI no está configurada");
            throw new RuntimeException("API key no configurada");
        }
        if (model == null || model.trim().isEmpty()) {
            model = "gemini-2.5-flash";
        }

        try {
            // Configurar los encabezados
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Crear el cuerpo de la solicitud
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", new Object[]{
                new HashMap<String, Object>() {{
                    put("role", "user");
                    put("parts", new Object[]{
                        new HashMap<String, String>() {{
                            put("text", prompt);
                        }}
                    });
                }}
            });
            
            // Configurar parámetros de generación
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topP", 0.9);
            generationConfig.put("topK", 40);
            generationConfig.put("maxOutputTokens", 1024);
            
            requestBody.put("generationConfig", generationConfig);
            
            // Crear la entidad de la solicitud
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Realizar la llamada a la API
            String url = String.format(GEMINI_API_BASE, model) + "?key=" + apiKey;
            logger.debug("Enviando solicitud a Gemini API: {}", url);
            
            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class);
                
                logger.debug("Respuesta recibida de Gemini API: {}", response.getStatusCode());
                
                // Procesar la respuesta
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    Map<String, Object> responseBody = response.getBody();
                    logger.debug("Cuerpo de la respuesta: {}", responseBody);
                    
                    if (responseBody.containsKey("candidates")) {
                        java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) responseBody.get("candidates");
                        if (candidates != null && !candidates.isEmpty()) {
                            Map<String, Object> candidate = candidates.get(0);
                            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                            if (content != null) {
                                java.util.List<Map<String, String>> parts = (java.util.List<Map<String, String>>) content.get("parts");
                                if (parts != null && !parts.isEmpty()) {
                                    return parts.get(0).get("text");
                                }
                            }
                        }
                    }
                    
                    logger.warn("No se pudo extraer la respuesta del cuerpo: {}", responseBody);
                    return "No se pudo generar una respuesta en este momento. (Formato de respuesta inesperado)";
                } else {
                    logger.error("Error en la respuesta de la API: {} - cuerpo: {}", response.getStatusCode(), response.getBody());
                    return "Error en la respuesta del servicio de IA: " + response.getStatusCode();
                }
                
            } catch (HttpClientErrorException e) {
                logger.error("Error HTTP al llamar a la API de Gemini: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
                throw new RuntimeException("Error al comunicarse con el servicio de IA: " + e.getStatusText(), e);
            } catch (RestClientException e) {
                logger.error("Error al realizar la solicitud a la API de Gemini", e);
                throw new RuntimeException("Error al procesar la solicitud: " + e.getMessage(), e);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado en generateResponse", e);
            throw new RuntimeException("Error al generar la respuesta: " + e.getMessage(), e);
        }
    }
}

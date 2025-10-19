package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class GeminiController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(GeminiController.class);
    
    private final GeminiService geminiService;

    // Prompt del sistema configurable para dar contexto del sitio
    @Value("${ASSISTANT_SYSTEM_PROMPT:Actúa como un asistente de la aplicación Kalium. Responde de forma breve y útil sobre la página y sus funcionalidades. Si el usuario tiene dudas de navegación, guíalo con pasos claros.}")
    private String systemPrompt;

    @Autowired
    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatPost(@RequestBody(required = false) Map<String, String> request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("El cuerpo de la solicitud no puede estar vacío"));
            }
            
            String prompt = request.get("prompt");
            String context = request.getOrDefault("context", "");
            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("El campo 'prompt' es requerido"));
            }
            
            String composedPrompt = buildComposedPrompt(systemPrompt, context, prompt);
            logger.info("Recibida solicitud POST de chat. Contexto: {} | Prompt: {}", truncate(context, 200), truncate(prompt, 200));
            String response = geminiService.generateResponse(composedPrompt);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("response", response);
            
            return ResponseEntity.ok(responseBody);
            
        } catch (Exception e) {
            logger.error("Error en el endpoint POST /api/ai/chat", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al procesar la solicitud: " + e.getMessage()));
        }
    }

    @GetMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatGet() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Este endpoint solo acepta solicitudes POST. Por favor, envía un JSON con un campo 'prompt' que contenga tu mensaje.");
        response.put("ejemplo", "{\"prompt\": \"¿Cómo estás?\"}");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "AI service is running!");
        response.put("endpoints", new String[]{
            "POST /api/ai/chat - Envía un mensaje al asistente de IA",
            "GET /api/ai/test - Verifica que el servicio esté funcionando"
        });
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", message);
        return errorResponse;
    }

    private String buildComposedPrompt(String system, String context, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        if (system != null && !system.isBlank()) {
            sb.append("[SYSTEM]\n").append(system.trim()).append("\n\n");
        }
        if (context != null && !context.isBlank()) {
            sb.append("[PAGE CONTEXT]\n").append(context.trim()).append("\n\n");
        }
        sb.append("[USER]\n").append(userPrompt);
        return sb.toString();
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}

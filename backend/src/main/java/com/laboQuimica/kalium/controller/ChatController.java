package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final GeminiService geminiService;

    @Autowired
    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody String message) {
        try {
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El mensaje no puede estar vacío");
            }
            
            String response = geminiService.generateResponse(message);
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al procesar el mensaje: " + e.getMessage());
        }
    }
}

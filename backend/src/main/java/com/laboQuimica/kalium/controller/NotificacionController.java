package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.dto.NotificacionDTO;
import com.laboQuimica.kalium.dto.NotificacionResumenDTO;
import com.laboQuimica.kalium.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificacionController {
    
    @Autowired
    private NotificacionService notificacionService;
    
    /**
     * Obtener todas las notificaciones de un usuario
     * GET /api/notificaciones/usuario/{idUsuario}
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<NotificacionDTO>> obtenerPorUsuario(@PathVariable Integer idUsuario) {
        try {
            List<NotificacionDTO> notificaciones = notificacionService.obtenerPorUsuario(idUsuario);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Obtener notificaciones no leídas de un usuario
     * GET /api/notificaciones/usuario/{idUsuario}/no-leidas
     */
    @GetMapping("/usuario/{idUsuario}/no-leidas")
    public ResponseEntity<List<NotificacionDTO>> obtenerNoLeidas(@PathVariable Integer idUsuario) {
        try {
            List<NotificacionDTO> notificaciones = notificacionService.obtenerNoLeidasPorUsuario(idUsuario);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Contar notificaciones no leídas
     * GET /api/notificaciones/usuario/{idUsuario}/count
     */
    @GetMapping("/usuario/{idUsuario}/count")
    public ResponseEntity<Long> contarNoLeidas(@PathVariable Integer idUsuario) {
        try {
            Long count = notificacionService.contarNoLeidas(idUsuario);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Obtener resumen de notificaciones
     * GET /api/notificaciones/usuario/{idUsuario}/resumen
     */
    @GetMapping("/usuario/{idUsuario}/resumen")
    public ResponseEntity<NotificacionResumenDTO> obtenerResumen(@PathVariable Integer idUsuario) {
        try {
            NotificacionResumenDTO resumen = notificacionService.obtenerResumen(idUsuario);
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Marcar una notificación como leída
     * PATCH /api/notificaciones/{id}/leer
     */
    @PatchMapping("/{id}/leer")
    public ResponseEntity<NotificacionDTO> marcarComoLeida(@PathVariable Integer id) {
        try {
            NotificacionDTO notificacion = notificacionService.marcarComoLeida(id);
            return ResponseEntity.ok(notificacion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     * PATCH /api/notificaciones/usuario/{idUsuario}/leer-todas
     */
    @PatchMapping("/usuario/{idUsuario}/leer-todas")
    public ResponseEntity<String> marcarTodasComoLeidas(@PathVariable Integer idUsuario) {
        try {
            notificacionService.marcarTodasComoLeidas(idUsuario);
            return ResponseEntity.ok("Todas las notificaciones marcadas como leídas");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al marcar notificaciones");
        }
    }
    
    /**
     * Eliminar una notificación
     * DELETE /api/notificaciones/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Integer id) {
        try {
            notificacionService.eliminar(id);
            return ResponseEntity.ok("Notificación eliminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar notificación");
        }
    }
    
    /**
     * Eliminar notificaciones leídas de un usuario
     * DELETE /api/notificaciones/usuario/{idUsuario}/limpiar
     */
    @DeleteMapping("/usuario/{idUsuario}/limpiar")
    public ResponseEntity<String> eliminarLeidas(@PathVariable Integer idUsuario) {
        try {
            notificacionService.eliminarLeidasDeUsuario(idUsuario);
            return ResponseEntity.ok("Notificaciones leídas eliminadas");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al limpiar notificaciones");
        }
    }

    @PostMapping("/verificar-stock")
    public ResponseEntity<String> verificarTodoElStock() {
        try {
            int notificacionesCreadas = notificacionService.verificarTodoElStock();
            return ResponseEntity.ok("Verificación completada. " + notificacionesCreadas + " notificaciones creadas.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al verificar stock: " + e.getMessage());
        }
    }
    
}
package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Horario;
import com.laboQuimica.kalium.repository.HorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {
    
    @Autowired
    private HorarioRepository horarioRepository;
    
    /**
     * Obtener todos los horarios
     * GET /api/horarios
     */
    @GetMapping
    public ResponseEntity<List<Horario>> obtenerTodos() {
        try {
            List<Horario> horarios = horarioRepository.findAll();
            return ResponseEntity.ok(horarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener un horario por ID
     * GET /api/horarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Horario> obtenerPorId(@PathVariable Integer id) {
        return horarioRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Crear un nuevo horario
     * POST /api/horarios
     * 
     * Body ejemplo:
     * {
     *   "fechaEntrega": "2025-01-20",
     *   "horaInicio": "2025-01-20T14:00:00"
     * }
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Horario horario) {
        try {
            // Validaciones básicas
            if (horario.getFechaEntrega() == null) {
                return ResponseEntity.badRequest()
                    .body("La fecha de entrega es obligatoria");
            }
            
            if (horario.getHoraInicio() == null) {
                return ResponseEntity.badRequest()
                    .body("La hora de inicio es obligatoria");
            }
            
            // Validar que la fecha no sea pasada
            LocalDate hoy = LocalDate.now();
            if (horario.getFechaEntrega().isBefore(hoy)) {
                return ResponseEntity.badRequest()
                    .body("La fecha de entrega no puede ser anterior a hoy");
            }
            
            // Validar que la hora no sea pasada (si es hoy)
            if (horario.getFechaEntrega().isEqual(hoy)) {
                LocalDateTime ahora = LocalDateTime.now();
                if (horario.getHoraInicio().isBefore(ahora)) {
                    return ResponseEntity.badRequest()
                        .body("La hora de inicio no puede ser anterior a la hora actual");
                }
            }
            
            // Guardar el horario
            Horario nuevoHorario = horarioRepository.save(horario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoHorario);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear horario: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar un horario existente
     * PUT /api/horarios/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Horario horario) {
        return horarioRepository.findById(id)
            .map(horarioExistente -> {
                try {
                    // Actualizar campos
                    if (horario.getFechaEntrega() != null) {
                        horarioExistente.setFechaEntrega(horario.getFechaEntrega());
                    }
                    
                    if (horario.getHoraInicio() != null) {
                        horarioExistente.setHoraInicio(horario.getHoraInicio());
                    }
                    
                    Horario actualizado = horarioRepository.save(horarioExistente);
                    return ResponseEntity.ok(actualizado);
                    
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al actualizar: " + e.getMessage());
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Eliminar un horario
     * DELETE /api/horarios/{id}
     * 
     * NOTA: Solo se puede eliminar si no está asignado a ningún pedido
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            if (!horarioRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            horarioRepository.deleteById(id);
            return ResponseEntity.ok()
                .body("Horario eliminado correctamente");
                
        } catch (Exception e) {
            // Si hay error de FK constraint, significa que está siendo usado
            if (e.getMessage().contains("foreign key constraint")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar: el horario está asignado a uno o más pedidos");
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar horario: " + e.getMessage());
        }
    }
    
    /**
     * Obtener horarios disponibles (fechas futuras)
     * GET /api/horarios/disponibles
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<Horario>> obtenerDisponibles() {
        try {
            List<Horario> todosHorarios = horarioRepository.findAll();
            LocalDateTime ahora = LocalDateTime.now();
            
            // Filtrar solo horarios futuros
            List<Horario> disponibles = todosHorarios.stream()
                .filter(h -> h.getHoraInicio().isAfter(ahora))
                .toList();
            
            return ResponseEntity.ok(disponibles);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
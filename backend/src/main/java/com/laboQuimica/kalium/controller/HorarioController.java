package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Horario;
import com.laboQuimica.kalium.service.HorarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@CrossOrigin(origins = "http://localhost:5173")
public class HorarioController {
    
    @Autowired
    private HorarioService horarioService;
    
    @GetMapping
    public ResponseEntity<List<Horario>> obtenerTodos() {
        return ResponseEntity.ok(horarioService.obtenerTodos());
    }
    
    @GetMapping("/disponibles")
    public ResponseEntity<List<Horario>> obtenerDisponibles() {
        return ResponseEntity.ok(horarioService.obtenerDisponibles());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Horario> obtenerPorId(@PathVariable Integer id) {
        return horarioService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Horario> crear(@RequestBody Horario horario) {
        return ResponseEntity.ok(horarioService.guardar(horario));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            horarioService.eliminar(id);
            return ResponseEntity.ok().body("Horario eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar horario: " + e.getMessage());
        }
    }
}

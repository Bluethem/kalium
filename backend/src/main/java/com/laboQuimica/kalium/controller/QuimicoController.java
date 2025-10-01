package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Quimico;
import com.laboQuimica.kalium.service.QuimicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quimicos")
@CrossOrigin(origins = "http://localhost:5173")
public class QuimicoController {
    
    @Autowired
    private QuimicoService quimicoService;
    
    @GetMapping
    public ResponseEntity<List<Quimico>> obtenerTodos() {
        return ResponseEntity.ok(quimicoService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Quimico> obtenerPorId(@PathVariable Integer id) {
        return quimicoService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/tipo/{idTipo}")
    public ResponseEntity<List<Quimico>> obtenerPorTipo(@PathVariable Integer idTipo) {
        try {
            return ResponseEntity.ok(quimicoService.obtenerPorTipo(idTipo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Quimico quimico) {
        try {
            Quimico nuevoQuimico = quimicoService.guardar(quimico);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoQuimico);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear químico: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Quimico quimico) {
        try {
            Quimico quimicoActualizado = quimicoService.actualizar(id, quimico);
            return ResponseEntity.ok(quimicoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar químico: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            quimicoService.eliminar(id);
            return ResponseEntity.ok().body("Químico eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar químico: " + e.getMessage());
        }
    }
}
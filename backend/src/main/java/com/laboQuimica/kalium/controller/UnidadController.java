package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Unidad;
import com.laboQuimica.kalium.repository.UnidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unidades")
public class UnidadController {
    
    @Autowired
    private UnidadRepository unidadRepository;
    
    @GetMapping
    public ResponseEntity<List<Unidad>> obtenerTodas() {
        return ResponseEntity.ok(unidadRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Unidad> obtenerPorId(@PathVariable Integer id) {
        return unidadRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Unidad unidad) {
        try {
            Unidad nuevaUnidad = unidadRepository.save(unidad);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaUnidad);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear unidad: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Unidad unidad) {
        return unidadRepository.findById(id)
            .map(unidadExistente -> {
                unidadExistente.setUnidad(unidad.getUnidad());
                Unidad unidadActualizada = unidadRepository.save(unidadExistente);
                return ResponseEntity.ok(unidadActualizada);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            unidadRepository.deleteById(id);
            return ResponseEntity.ok().body("Unidad eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar unidad: " + e.getMessage());
        }
    }
}

package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.EstDevolucion;
import com.laboQuimica.kalium.repository.EstDevolucionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estados-devolucion")
public class EstDevolucionController {
    
    @Autowired
    private EstDevolucionRepository estDevolucionRepository;
    
    /**
     * Obtener todos los estados de devolución
     * GET /api/estados-devolucion
     */
    @GetMapping
    public ResponseEntity<List<EstDevolucion>> obtenerTodos() {
        try {
            List<EstDevolucion> estados = estDevolucionRepository.findAll();
            return ResponseEntity.ok(estados);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtener un estado por ID
     * GET /api/estados-devolucion/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<EstDevolucion> obtenerPorId(@PathVariable Integer id) {
        return estDevolucionRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
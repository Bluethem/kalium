package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Devolucion;
import com.laboQuimica.kalium.repository.DevolucionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devoluciones")
@CrossOrigin(origins = "http://localhost:5173")
public class DevolucionController {
    
    @Autowired
    private DevolucionRepository devolucionRepository;
    
    @GetMapping
    public ResponseEntity<List<Devolucion>> obtenerTodas() {
        return ResponseEntity.ok(devolucionRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Devolucion> obtenerPorId(@PathVariable Integer id) {
        return devolucionRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
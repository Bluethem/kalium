package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Estudiante;
import com.laboQuimica.kalium.repository.EstudianteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
@CrossOrigin(origins = "http://localhost:5173")
public class EstudianteController {
    
    @Autowired
    private EstudianteRepository estudianteRepository;
    
    @GetMapping
    public ResponseEntity<List<Estudiante>> obtenerTodos() {
        return ResponseEntity.ok(estudianteRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Estudiante> obtenerPorId(@PathVariable Integer id) {
        return estudianteRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
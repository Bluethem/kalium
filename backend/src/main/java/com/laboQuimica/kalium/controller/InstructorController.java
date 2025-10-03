package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Instructor;
import com.laboQuimica.kalium.repository.InstructorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructores")
@CrossOrigin(origins = "http://localhost:5173")
public class InstructorController {
    
    @Autowired
    private InstructorRepository instructorRepository;
    
    @GetMapping
    public ResponseEntity<List<Instructor>> obtenerTodos() {
        return ResponseEntity.ok(instructorRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Instructor> obtenerPorId(@PathVariable Integer id) {
        return instructorRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.EstInsumo;
import com.laboQuimica.kalium.repository.EstInsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estados-insumo")
@CrossOrigin(origins = "http://localhost:5173")
public class EstInsumoController {
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    @GetMapping
    public ResponseEntity<List<EstInsumo>> obtenerTodos() {
        return ResponseEntity.ok(estInsumoRepository.findAll());
    }
}
package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Categoria;
import com.laboQuimica.kalium.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoriaController {
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @GetMapping
    public ResponseEntity<List<Categoria>> obtenerTodas() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerPorId(@PathVariable Integer id) {
        return categoriaRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Categoria categoria) {
        try {
            Categoria nuevaCategoria = categoriaRepository.save(categoria);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCategoria);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear categoría: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Categoria categoria) {
        return categoriaRepository.findById(id)
            .map(categoriaExistente -> {
                categoriaExistente.setNombreCategoria(categoria.getNombreCategoria());
                Categoria categoriaActualizada = categoriaRepository.save(categoriaExistente);
                return ResponseEntity.ok(categoriaActualizada);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            categoriaRepository.deleteById(id);
            return ResponseEntity.ok().body("Categoría eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar categoría: " + e.getMessage());
        }
    }
}

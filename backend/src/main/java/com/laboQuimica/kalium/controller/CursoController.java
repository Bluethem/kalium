package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Curso;
import com.laboQuimica.kalium.repository.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {
    
    @Autowired
    private CursoRepository cursoRepository;
    
    @GetMapping
    public ResponseEntity<List<Curso>> obtenerTodos() {
        return ResponseEntity.ok(cursoRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtenerPorId(@PathVariable Integer id) {
        return cursoRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Curso> crear(@RequestBody Curso curso) {
        try {
            // Si no viene código, generar uno automático o dejarlo null
            if (curso.getCodigo() == null || curso.getCodigo().trim().isEmpty()) {
                curso.setCodigo("CUR-" + System.currentTimeMillis());
            }
            
            Curso nuevoCurso = cursoRepository.save(curso);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCurso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Curso> actualizar(@PathVariable Integer id, @RequestBody Curso curso) {
        return cursoRepository.findById(id)
            .map(cursoExistente -> {
                cursoExistente.setNombreCurso(curso.getNombreCurso());
                if (curso.getCodigo() != null && !curso.getCodigo().trim().isEmpty()) {
                    cursoExistente.setCodigo(curso.getCodigo());
                }
                if (curso.getDescripcion() != null) {
                    cursoExistente.setDescripcion(curso.getDescripcion());
                }
                Curso cursoActualizado = cursoRepository.save(cursoExistente);
                return ResponseEntity.ok(cursoActualizado);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            cursoRepository.deleteById(id);
            return ResponseEntity.ok().body("Curso eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar curso: " + e.getMessage());
        }
    }
}
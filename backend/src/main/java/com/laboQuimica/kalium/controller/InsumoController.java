package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.dto.TipoInsumoStockDTO;
import com.laboQuimica.kalium.entity.Insumo;
import com.laboQuimica.kalium.entity.TipoInsumo;
import com.laboQuimica.kalium.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
@CrossOrigin(origins = "http://localhost:5173")
public class InsumoController {
    
    @Autowired
    private InsumoService insumoService;
    
    @GetMapping
    public ResponseEntity<List<Insumo>> obtenerTodos() {
        return ResponseEntity.ok(insumoService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Insumo> obtenerPorId(@PathVariable Integer id) {
        return insumoService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Insumo>> obtenerPorEstado(@PathVariable Integer idEstado) {
        try {
            return ResponseEntity.ok(insumoService.obtenerPorEstado(idEstado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/tipo/{idTipo}")
    public ResponseEntity<List<Insumo>> obtenerPorTipo(@PathVariable Integer idTipo) {
        try {
            return ResponseEntity.ok(insumoService.obtenerPorTipo(idTipo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Insumo insumo) {
        try {
            Insumo nuevoInsumo = insumoService.guardar(insumo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoInsumo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear insumo: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Insumo insumo) {
        try {
            Insumo insumoActualizado = insumoService.actualizar(id, insumo);
            return ResponseEntity.ok(insumoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar insumo: " + e.getMessage());
        }
    }
    
    @PatchMapping("/{idInsumo}/estado/{idEstado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer idInsumo, @PathVariable Integer idEstado) {
        try {
            Insumo insumoActualizado = insumoService.cambiarEstado(idInsumo, idEstado);
            return ResponseEntity.ok(insumoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            insumoService.eliminar(id);
            return ResponseEntity.ok().body("Insumo eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar insumo: " + e.getMessage());
        }
    }
    
    // Endpoints para TipoInsumo
    @GetMapping("/tipos")
    public ResponseEntity<List<TipoInsumo>> obtenerTodosTipos() {
        return ResponseEntity.ok(insumoService.obtenerTodosTipos());
    }
    
    @GetMapping("/tipos/stock")
    public ResponseEntity<List<TipoInsumoStockDTO>> obtenerTodosTiposConStock() {
        return ResponseEntity.ok(insumoService.obtenerTodosTiposConStock());
    }
    
    @GetMapping("/tipos/categoria/{idCategoria}")
    public ResponseEntity<List<TipoInsumo>> obtenerTiposPorCategoria(@PathVariable Integer idCategoria) {
        try {
            return ResponseEntity.ok(insumoService.obtenerTiposPorCategoria(idCategoria));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/tipos")
    public ResponseEntity<?> crearTipo(@RequestBody TipoInsumo tipoInsumo) {
        try {
            TipoInsumo nuevoTipo = insumoService.guardarTipo(tipoInsumo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear tipo de insumo: " + e.getMessage());
        }
    }
}
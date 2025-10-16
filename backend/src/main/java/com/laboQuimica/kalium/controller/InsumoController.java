package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.dto.TipoInsumoStockDTO;
import com.laboQuimica.kalium.entity.Insumo;
import com.laboQuimica.kalium.entity.TipoInsumo;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.service.InsumoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
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
            .orElseThrow(() -> new ResourceNotFoundException("Insumo", "id", id));
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Insumo>> obtenerPorEstado(@PathVariable Integer idEstado) {
        return ResponseEntity.ok(insumoService.obtenerPorEstado(idEstado));
    }
    
    @GetMapping("/tipo/{idTipo}")
    public ResponseEntity<List<Insumo>> obtenerPorTipo(@PathVariable Integer idTipo) {
        return ResponseEntity.ok(insumoService.obtenerPorTipo(idTipo));
    }
    
    @PostMapping
    public ResponseEntity<Insumo> crear(@Valid @RequestBody Insumo insumo) {
        Insumo nuevoInsumo = insumoService.guardar(insumo);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoInsumo);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Insumo> actualizar(@PathVariable Integer id, @Valid @RequestBody Insumo insumo) {
        Insumo insumoActualizado = insumoService.actualizar(id, insumo);
        return ResponseEntity.ok(insumoActualizado);
    }
    
    @PatchMapping("/{idInsumo}/estado/{idEstado}")
    public ResponseEntity<Insumo> cambiarEstado(@PathVariable Integer idInsumo, @PathVariable Integer idEstado) {
        Insumo insumoActualizado = insumoService.cambiarEstado(idInsumo, idEstado);
        return ResponseEntity.ok(insumoActualizado);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        insumoService.eliminar(id);
        return ResponseEntity.noContent().build();
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
        return ResponseEntity.ok(insumoService.obtenerTiposPorCategoria(idCategoria));
    }
    
    @PostMapping("/tipos")
    public ResponseEntity<TipoInsumo> crearTipo(@Valid @RequestBody TipoInsumo tipoInsumo) {
        TipoInsumo nuevoTipo = insumoService.guardarTipo(tipoInsumo);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipo);
    }
}
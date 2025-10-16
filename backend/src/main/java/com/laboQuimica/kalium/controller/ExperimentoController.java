package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.DetalleExperimento;
import com.laboQuimica.kalium.entity.Experimento;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.service.ExperimentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experimentos")
public class ExperimentoController {
    
    @Autowired
    private ExperimentoService experimentoService;
    
    /**
     * Obtener todos los experimentos
     * GET /api/experimentos
     */
    @GetMapping
    public ResponseEntity<List<Experimento>> obtenerTodos() {
        return ResponseEntity.ok(experimentoService.obtenerTodos());
    }
    
    /**
     * Obtener un experimento por ID
     * GET /api/experimentos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Experimento> obtenerPorId(@PathVariable Integer id) {
        return experimentoService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("Experimento", "id", id));
    }
    
    /**
     * Obtener detalles de un experimento (insumos necesarios)
     * GET /api/experimentos/{id}/detalles
     */
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetalleExperimento>> obtenerDetalles(@PathVariable Integer id) {
        return ResponseEntity.ok(experimentoService.obtenerDetalles(id));
    }
    
    /**
     * Crear un nuevo experimento
     * POST /api/experimentos
     * 
     * Body ejemplo:
     * {
     *   "nombreExperimento": "Titulación Ácido-Base"
     * }
     */
    @PostMapping
    public ResponseEntity<Experimento> crear(@Valid @RequestBody Experimento experimento) {
        Experimento nuevoExperimento = experimentoService.guardar(experimento);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoExperimento);
    }
    
    /**
     * Agregar un detalle (insumo) a un experimento
     * POST /api/experimentos/detalles
     * 
     * Body ejemplo:
     * {
     *   "cantInsumoExperimento": 50,
     *   "tipoInsumo": { "idTipoInsumo": 1 },
     *   "experimento": { "idExperimento": 1 }
     * }
     */
    @PostMapping("/detalles")
    public ResponseEntity<DetalleExperimento> agregarDetalle(@Valid @RequestBody DetalleExperimento detalle) {
        DetalleExperimento nuevoDetalle = experimentoService.agregarDetalle(detalle);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoDetalle);
    }
    
    /**
     * Actualizar un experimento existente
     * PUT /api/experimentos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Experimento> actualizar(@PathVariable Integer id, @Valid @RequestBody Experimento experimento) {
        Experimento experimentoActualizado = experimentoService.actualizar(id, experimento);
        return ResponseEntity.ok(experimentoActualizado);
    }
    
    /**
     * Eliminar un experimento
     * DELETE /api/experimentos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        experimentoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Eliminar un detalle de experimento
     * DELETE /api/experimentos/detalles/{id}
     */
    @DeleteMapping("/detalles/{id}")
    public ResponseEntity<Void> eliminarDetalle(@PathVariable Integer id) {
        experimentoService.eliminarDetalle(id);
        return ResponseEntity.noContent().build();
    }
}
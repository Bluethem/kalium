package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.DetalleExperimento;
import com.laboQuimica.kalium.entity.Experimento;
import com.laboQuimica.kalium.service.ExperimentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experimentos")
@CrossOrigin(origins = "http://localhost:5173")
public class ExperimentoController {
    
    @Autowired
    private ExperimentoService experimentoService;
    
    /**
     * Obtener todos los experimentos
     * GET /api/experimentos
     */
    @GetMapping
    public ResponseEntity<List<Experimento>> obtenerTodos() {
        try {
            List<Experimento> experimentos = experimentoService.obtenerTodos();
            return ResponseEntity.ok(experimentos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener un experimento por ID
     * GET /api/experimentos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Experimento> obtenerPorId(@PathVariable Integer id) {
        return experimentoService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Obtener detalles de un experimento (insumos necesarios)
     * GET /api/experimentos/{id}/detalles
     */
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetalleExperimento>> obtenerDetalles(@PathVariable Integer id) {
        try {
            List<DetalleExperimento> detalles = experimentoService.obtenerDetalles(id);
            return ResponseEntity.ok(detalles);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
    public ResponseEntity<?> crear(@RequestBody Experimento experimento) {
        try {
            Experimento nuevoExperimento = experimentoService.guardar(experimento);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoExperimento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear experimento: " + e.getMessage());
        }
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
    public ResponseEntity<?> agregarDetalle(@RequestBody DetalleExperimento detalle) {
        try {
            DetalleExperimento nuevoDetalle = experimentoService.agregarDetalle(detalle);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoDetalle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al agregar detalle: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar un experimento existente
     * PUT /api/experimentos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Experimento experimento) {
        try {
            Experimento experimentoActualizado = experimentoService.actualizar(id, experimento);
            return ResponseEntity.ok(experimentoActualizado);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar experimento: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar un experimento
     * DELETE /api/experimentos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            experimentoService.eliminar(id);
            return ResponseEntity.ok().body("Experimento eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar experimento: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar un detalle de experimento
     * DELETE /api/experimentos/detalles/{id}
     */
    @DeleteMapping("/detalles/{id}")
    public ResponseEntity<?> eliminarDetalle(@PathVariable Integer id) {
        try {
            experimentoService.eliminarDetalle(id);
            return ResponseEntity.ok().body("Detalle eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar detalle: " + e.getMessage());
        }
    }
}
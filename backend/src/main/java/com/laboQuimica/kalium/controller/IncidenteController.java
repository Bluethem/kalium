package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Incidentes;
import com.laboQuimica.kalium.entity.EstIncidente;
import com.laboQuimica.kalium.service.IncidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidentes")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidenteController {
    
    @Autowired
    private IncidenteService incidenteService;
    
    /**
     * Obtener todos los incidentes
     * GET /api/incidentes
     */
    @GetMapping
    public ResponseEntity<List<Incidentes>> obtenerTodos() {
        return ResponseEntity.ok(incidenteService.obtenerTodos());
    }
    
    /**
     * Obtener un incidente por ID
     * GET /api/incidentes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Incidentes> obtenerPorId(@PathVariable Integer id) {
        return incidenteService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Obtener incidentes por estado
     * GET /api/incidentes/estado/{idEstado}
     */
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Incidentes>> obtenerPorEstado(@PathVariable Integer idEstado) {
        try {
            return ResponseEntity.ok(incidenteService.obtenerPorEstado(idEstado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener incidentes por estudiante
     * GET /api/incidentes/estudiante/{idEstudiante}
     */
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<Incidentes>> obtenerPorEstudiante(@PathVariable Integer idEstudiante) {
        try {
            return ResponseEntity.ok(incidenteService.obtenerPorEstudiante(idEstudiante));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener incidentes por devolución
     * GET /api/incidentes/devolucion/{idDevolucion}
     */
    @GetMapping("/devolucion/{idDevolucion}")
    public ResponseEntity<List<Incidentes>> obtenerPorDevolucion(@PathVariable Integer idDevolucion) {
        try {
            return ResponseEntity.ok(incidenteService.obtenerPorDevolucion(idDevolucion));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Crear un nuevo incidente
     * POST /api/incidentes
     * 
     * Body ejemplo:
     * {
     *   "descripcion": "Matraz roto durante la práctica",
     *   "fechaIncidente": "2025-01-16",
     *   "devolucion": { "idDevolucion": 1 },
     *   "estudiante": { "idEstudiante": 1 },
     *   "estIncidente": { "idEstIncidente": 1 }
     * }
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Incidentes incidente) {
        try {
            Incidentes nuevoIncidente = incidenteService.guardar(incidente);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoIncidente);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear incidente: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar un incidente existente
     * PUT /api/incidentes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Incidentes incidente) {
        try {
            Incidentes incidenteActualizado = incidenteService.actualizar(id, incidente);
            return ResponseEntity.ok(incidenteActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar incidente: " + e.getMessage());
        }
    }
    
    /**
     * Cambiar el estado de un incidente
     * PATCH /api/incidentes/{idIncidente}/estado/{idEstado}
     */
    @PatchMapping("/{idIncidente}/estado/{idEstado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer idIncidente, @PathVariable Integer idEstado) {
        try {
            Incidentes incidenteActualizado = incidenteService.cambiarEstado(idIncidente, idEstado);
            return ResponseEntity.ok(incidenteActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Resolver un incidente (marcarlo como resuelto)
     * PATCH /api/incidentes/{id}/resolver
     */
    @PatchMapping("/{id}/resolver")
    public ResponseEntity<?> resolver(@PathVariable Integer id) {
        try {
            Incidentes incidenteResuelto = incidenteService.resolverIncidente(id);
            return ResponseEntity.ok(incidenteResuelto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Eliminar un incidente
     * DELETE /api/incidentes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            incidenteService.eliminar(id);
            return ResponseEntity.ok().body("Incidente eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar incidente: " + e.getMessage());
        }
    }
    
    /**
     * Obtener todos los estados de incidente
     * GET /api/incidentes/estados
     */
    @GetMapping("/estados")
    public ResponseEntity<List<EstIncidente>> obtenerEstados() {
        return ResponseEntity.ok(incidenteService.obtenerTodosEstados());
    }
}
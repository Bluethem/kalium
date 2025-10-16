package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Incidentes;
import com.laboQuimica.kalium.entity.EstIncidente;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.service.IncidenteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidentes")
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
            .orElseThrow(() -> new ResourceNotFoundException("Incidente", "id", id));
    }
    
    /**
     * Obtener incidentes por estado
     * GET /api/incidentes/estado/{idEstado}
     */
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Incidentes>> obtenerPorEstado(@PathVariable Integer idEstado) {
        return ResponseEntity.ok(incidenteService.obtenerPorEstado(idEstado));
    }
    
    /**
     * Obtener incidentes por estudiante
     * GET /api/incidentes/estudiante/{idEstudiante}
     */
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<Incidentes>> obtenerPorEstudiante(@PathVariable Integer idEstudiante) {
        return ResponseEntity.ok(incidenteService.obtenerPorEstudiante(idEstudiante));
    }
    
    /**
     * Obtener incidentes por devolución
     * GET /api/incidentes/devolucion/{idDevolucion}
     */
    @GetMapping("/devolucion/{idDevolucion}")
    public ResponseEntity<List<Incidentes>> obtenerPorDevolucion(@PathVariable Integer idDevolucion) {
        return ResponseEntity.ok(incidenteService.obtenerPorDevolucion(idDevolucion));
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
    public ResponseEntity<Incidentes> crear(@Valid @RequestBody Incidentes incidente) {
        Incidentes nuevoIncidente = incidenteService.guardar(incidente);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoIncidente);
    }
    
    /**
     * Actualizar un incidente existente
     * PUT /api/incidentes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Incidentes> actualizar(@PathVariable Integer id, @Valid @RequestBody Incidentes incidente) {
        Incidentes incidenteActualizado = incidenteService.actualizar(id, incidente);
        return ResponseEntity.ok(incidenteActualizado);
    }
    
    /**
     * Cambiar el estado de un incidente
     * PATCH /api/incidentes/{idIncidente}/estado/{idEstado}
     */
    @PatchMapping("/{idIncidente}/estado/{idEstado}")
    public ResponseEntity<Incidentes> cambiarEstado(@PathVariable Integer idIncidente, @PathVariable Integer idEstado) {
        Incidentes incidenteActualizado = incidenteService.cambiarEstado(idIncidente, idEstado);
        return ResponseEntity.ok(incidenteActualizado);
    }
    
    /**
     * Resolver un incidente (marcarlo como resuelto)
     * PATCH /api/incidentes/{id}/resolver
     */
    @PatchMapping("/{id}/resolver")
    public ResponseEntity<Incidentes> resolver(@PathVariable Integer id) {
        Incidentes incidenteResuelto = incidenteService.resolverIncidente(id);
        return ResponseEntity.ok(incidenteResuelto);
    }

    /*
     Cancelar un incidente
      PATCH /api/incidentes/{id}/cancelar
    */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Incidentes> cancelar(@PathVariable Integer id) {
        Incidentes incidenteCancelado = incidenteService.cancelarIncidente(id);
        return ResponseEntity.ok(incidenteCancelado);
    }
    
    /**
     * Eliminar un incidente
     * DELETE /api/incidentes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        incidenteService.eliminar(id);
        return ResponseEntity.noContent().build();
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
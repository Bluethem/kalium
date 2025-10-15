package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Entrega;
import com.laboQuimica.kalium.entity.EntregaInsumo;
import com.laboQuimica.kalium.entity.EntregaQuimico;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.service.EntregaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas")
public class EntregaController {
    
    @Autowired
    private EntregaService entregaService;
    
    /**
     * Obtener todas las entregas
     * GET /api/entregas
     */
    @GetMapping
    public ResponseEntity<List<Entrega>> obtenerTodas() {
        return ResponseEntity.ok(entregaService.obtenerTodas());
    }
    
    /**
     * Obtener una entrega por ID
     * GET /api/entregas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Entrega> obtenerPorId(@PathVariable Integer id) {
        return entregaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("Entrega", "id", id));
    }
    
    /**
     * Obtener entregas por pedido
     * GET /api/entregas/pedido/{idPedido}
     */
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<Entrega>> obtenerPorPedido(@PathVariable Integer idPedido) {
        return ResponseEntity.ok(entregaService.obtenerPorPedido(idPedido));
    }
    
    /**
     * Obtener entregas por estudiante
     * GET /api/entregas/estudiante/{idEstudiante}
     */
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<Entrega>> obtenerPorEstudiante(@PathVariable Integer idEstudiante) {
        return ResponseEntity.ok(entregaService.obtenerPorEstudiante(idEstudiante));
    }
    
    /**
     * Obtener insumos de una entrega
     * GET /api/entregas/{id}/insumos
     */
    @GetMapping("/{id}/insumos")
    public ResponseEntity<List<EntregaInsumo>> obtenerInsumos(@PathVariable Integer id) {
        return ResponseEntity.ok(entregaService.obtenerInsumosPorEntrega(id));
    }
    
    /**
     * Obtener químicos de una entrega
     * GET /api/entregas/{id}/quimicos
     */
    @GetMapping("/{id}/quimicos")
    public ResponseEntity<List<EntregaQuimico>> obtenerQuimicos(@PathVariable Integer id) {
        return ResponseEntity.ok(entregaService.obtenerQuimicosPorEntrega(id));
    }
    
    /**
     * Crear una nueva entrega
     * POST /api/entregas
     * 
     * Body ejemplo:
     * {
     *   "fechaEntrega": "2025-01-20",
     *   "horaEntrega": "2025-01-20T14:30:00",
     *   "pedido": { "idPedido": 1 },
     *   "estudiante": { "idEstudiante": 1 }
     * }
     */
    @PostMapping
    public ResponseEntity<Entrega> crear(@Valid @RequestBody Entrega entrega) {
        Entrega nuevaEntrega = entregaService.guardar(entrega);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntrega);
    }
    
    /**
     * Agregar un insumo a una entrega
     * POST /api/entregas/insumos
     * 
     * Body ejemplo:
     * {
     *   "entrega": { "idEntrega": 1 },
     *   "insumo": { "idInsumo": 5 }
     * }
     */
    @PostMapping("/insumos")
    public ResponseEntity<EntregaInsumo> crearEntregaInsumo(@Valid @RequestBody EntregaInsumo entregaInsumo) {
        EntregaInsumo nuevaEntregaInsumo = entregaService.guardarEntregaInsumo(entregaInsumo);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntregaInsumo);
    }
    
    /**
     * Agregar un químico a una entrega
     * POST /api/entregas/quimicos
     * 
     * Body ejemplo:
     * {
     *   "entrega": { "idEntrega": 1 },
     *   "quimico": { "idQuimico": 2 }
     * }
     */
    @PostMapping("/quimicos")
    public ResponseEntity<EntregaQuimico> crearEntregaQuimico(@Valid @RequestBody EntregaQuimico entregaQuimico) {
        EntregaQuimico nuevaEntregaQuimico = entregaService.guardarEntregaQuimico(entregaQuimico);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntregaQuimico);
    }
    
    /**
     * Actualizar una entrega existente
     * PUT /api/entregas/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Entrega> actualizar(@PathVariable Integer id, @Valid @RequestBody Entrega entrega) {
        Entrega entregaActualizada = entregaService.actualizar(id, entrega);
        return ResponseEntity.ok(entregaActualizada);
    }
    
    /**
     * Eliminar una entrega
     * DELETE /api/entregas/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        entregaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Eliminar un insumo de una entrega
     * DELETE /api/entregas/insumos/{id}
     */
    @DeleteMapping("/insumos/{id}")
    public ResponseEntity<Void> eliminarEntregaInsumo(@PathVariable Integer id) {
        entregaService.eliminarEntregaInsumo(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Eliminar un químico de una entrega
     * DELETE /api/entregas/quimicos/{id}
     */
    @DeleteMapping("/quimicos/{id}")
    public ResponseEntity<Void> eliminarEntregaQuimico(@PathVariable Integer id) {
        entregaService.eliminarEntregaQuimico(id);
        return ResponseEntity.noContent().build();
    }
    
    // ===== NUEVO: Endpoints para generación masiva de entregas =====
    
    /**
     * Generar entregas masivas para un pedido basándose en la cantidad de grupos
     * POST /api/entregas/generar/{idPedido}
     * 
     * Ejemplo: Pedido con 5 grupos → Genera 5 entregas
     */
    @PostMapping("/generar/{idPedido}")
    public ResponseEntity<?> generarEntregasPorGrupos(@PathVariable Integer idPedido) {
        try {
            List<Entrega> entregas = entregaService.generarEntregasPorGrupos(idPedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(entregas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Asignar un estudiante a una entrega específica
     * PUT /api/entregas/{idEntrega}/asignar-estudiante/{idEstudiante}
     */
    @PutMapping("/{idEntrega}/asignar-estudiante/{idEstudiante}")
    public ResponseEntity<?> asignarEstudiante(
            @PathVariable Integer idEntrega,
            @PathVariable Integer idEstudiante) {
        try {
            Entrega entrega = entregaService.asignarEstudianteAEntrega(idEntrega, idEstudiante);
            return ResponseEntity.ok(entrega);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Verificar si un pedido ya tiene entregas generadas
     * GET /api/entregas/verificar/{idPedido}
     */
    @GetMapping("/verificar/{idPedido}")
    public ResponseEntity<Boolean> verificarEntregas(@PathVariable Integer idPedido) {
        boolean tieneEntregas = entregaService.pedidoTieneEntregas(idPedido);
        return ResponseEntity.ok(tieneEntregas);
    }
    
    /**
     * Obtener entregas sin estudiante asignado de un pedido
     * GET /api/entregas/pendientes/{idPedido}
     */
    @GetMapping("/pendientes/{idPedido}")
    public ResponseEntity<List<Entrega>> obtenerEntregasSinEstudiante(@PathVariable Integer idPedido) {
        List<Entrega> entregas = entregaService.obtenerEntregasSinEstudiante(idPedido);
        return ResponseEntity.ok(entregas);
    }
}
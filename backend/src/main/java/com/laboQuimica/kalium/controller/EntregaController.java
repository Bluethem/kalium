package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Entrega;
import com.laboQuimica.kalium.entity.EntregaInsumo;
import com.laboQuimica.kalium.entity.EntregaQuimico;
import com.laboQuimica.kalium.service.EntregaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas")
@CrossOrigin(origins = "http://localhost:5173")
public class EntregaController {
    
    @Autowired
    private EntregaService entregaService;
    
    /**
     * Obtener todas las entregas
     * GET /api/entregas
     */
    @GetMapping
    public ResponseEntity<List<Entrega>> obtenerTodas() {
        try {
            List<Entrega> entregas = entregaService.obtenerTodas();
            return ResponseEntity.ok(entregas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener una entrega por ID
     * GET /api/entregas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Entrega> obtenerPorId(@PathVariable Integer id) {
        return entregaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Obtener entregas por pedido
     * GET /api/entregas/pedido/{idPedido}
     */
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<Entrega>> obtenerPorPedido(@PathVariable Integer idPedido) {
        try {
            List<Entrega> entregas = entregaService.obtenerPorPedido(idPedido);
            return ResponseEntity.ok(entregas);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener entregas por estudiante
     * GET /api/entregas/estudiante/{idEstudiante}
     */
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<Entrega>> obtenerPorEstudiante(@PathVariable Integer idEstudiante) {
        try {
            List<Entrega> entregas = entregaService.obtenerPorEstudiante(idEstudiante);
            return ResponseEntity.ok(entregas);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener insumos de una entrega
     * GET /api/entregas/{id}/insumos
     */
    @GetMapping("/{id}/insumos")
    public ResponseEntity<List<EntregaInsumo>> obtenerInsumos(@PathVariable Integer id) {
        try {
            List<EntregaInsumo> insumos = entregaService.obtenerInsumosPorEntrega(id);
            return ResponseEntity.ok(insumos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener químicos de una entrega
     * GET /api/entregas/{id}/quimicos
     */
    @GetMapping("/{id}/quimicos")
    public ResponseEntity<List<EntregaQuimico>> obtenerQuimicos(@PathVariable Integer id) {
        try {
            List<EntregaQuimico> quimicos = entregaService.obtenerQuimicosPorEntrega(id);
            return ResponseEntity.ok(quimicos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
    public ResponseEntity<?> crear(@RequestBody Entrega entrega) {
        try {
            Entrega nuevaEntrega = entregaService.guardar(entrega);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntrega);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear entrega: " + e.getMessage());
        }
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
    public ResponseEntity<?> crearEntregaInsumo(@RequestBody EntregaInsumo entregaInsumo) {
        try {
            EntregaInsumo nuevaEntregaInsumo = entregaService.guardarEntregaInsumo(entregaInsumo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntregaInsumo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear entrega de insumo: " + e.getMessage());
        }
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
    public ResponseEntity<?> crearEntregaQuimico(@RequestBody EntregaQuimico entregaQuimico) {
        try {
            EntregaQuimico nuevaEntregaQuimico = entregaService.guardarEntregaQuimico(entregaQuimico);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntregaQuimico);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear entrega de químico: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar una entrega existente
     * PUT /api/entregas/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Entrega entrega) {
        try {
            Entrega entregaActualizada = entregaService.actualizar(id, entrega);
            return ResponseEntity.ok(entregaActualizada);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar entrega: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar una entrega
     * DELETE /api/entregas/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            entregaService.eliminar(id);
            return ResponseEntity.ok().body("Entrega eliminada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar entrega: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar un insumo de una entrega
     * DELETE /api/entregas/insumos/{id}
     */
    @DeleteMapping("/insumos/{id}")
    public ResponseEntity<?> eliminarEntregaInsumo(@PathVariable Integer id) {
        try {
            entregaService.eliminarEntregaInsumo(id);
            return ResponseEntity.ok().body("Insumo eliminado de la entrega correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar insumo de entrega: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar un químico de una entrega
     * DELETE /api/entregas/quimicos/{id}
     */
    @DeleteMapping("/quimicos/{id}")
    public ResponseEntity<?> eliminarEntregaQuimico(@PathVariable Integer id) {
        try {
            entregaService.eliminarEntregaQuimico(id);
            return ResponseEntity.ok().body("Químico eliminado de la entrega correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar químico de entrega: " + e.getMessage());
        }
    }
}
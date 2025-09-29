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
    
    @GetMapping
    public ResponseEntity<List<Entrega>> obtenerTodas() {
        return ResponseEntity.ok(entregaService.obtenerTodas());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Entrega> obtenerPorId(@PathVariable Integer id) {
        return entregaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<Entrega>> obtenerPorPedido(@PathVariable Integer idPedido) {
        try {
            return ResponseEntity.ok(entregaService.obtenerPorPedido(idPedido));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<Entrega>> obtenerPorEstudiante(@PathVariable Integer idEstudiante) {
        try {
            return ResponseEntity.ok(entregaService.obtenerPorEstudiante(idEstudiante));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/insumos")
    public ResponseEntity<List<EntregaInsumo>> obtenerInsumos(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(entregaService.obtenerInsumosPorEntrega(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/quimicos")
    public ResponseEntity<List<EntregaQuimico>> obtenerQuimicos(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(entregaService.obtenerQuimicosPorEntrega(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Entrega entrega) {
        try {
            Entrega nuevaEntrega = entregaService.guardar(entrega);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntrega);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear entrega: " + e.getMessage());
        }
    }
    
    @PostMapping("/insumos")
    public ResponseEntity<?> crearEntregaInsumo(@RequestBody EntregaInsumo entregaInsumo) {
        try {
            EntregaInsumo nuevaEntregaInsumo = entregaService.guardarEntregaInsumo(entregaInsumo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntregaInsumo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear entrega de insumo: " + e.getMessage());
        }
    }
    
    @PostMapping("/quimicos")
    public ResponseEntity<?> crearEntregaQuimico(@RequestBody EntregaQuimico entregaQuimico) {
        try {
            EntregaQuimico nuevaEntregaQuimico = entregaService.guardarEntregaQuimico(entregaQuimico);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEntregaQuimico);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear entrega de químico: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Entrega entrega) {
        try {
            Entrega entregaActualizada = entregaService.actualizar(id, entrega);
            return ResponseEntity.ok(entregaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar entrega: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            entregaService.eliminar(id);
            return ResponseEntity.ok().body("Entrega eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar entrega: " + e.getMessage());
        }
    }
}

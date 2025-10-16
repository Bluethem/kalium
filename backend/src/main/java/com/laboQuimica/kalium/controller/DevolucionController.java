package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Devolucion;
import com.laboQuimica.kalium.entity.DevolucionDetalle;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.service.DevolucionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devoluciones")
public class DevolucionController {
    
    @Autowired
    private DevolucionService devolucionService;
    
    @GetMapping
    public ResponseEntity<List<Devolucion>> obtenerTodas() {
        return ResponseEntity.ok(devolucionService.obtenerTodas());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Devolucion> obtenerPorId(@PathVariable Integer id) {
        return devolucionService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("Devolucion", "id", id));
    }
    
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<Devolucion>> obtenerPorPedido(@PathVariable Integer idPedido) {
        return ResponseEntity.ok(devolucionService.obtenerPorPedido(idPedido));
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Devolucion>> obtenerPorEstado(@PathVariable Integer idEstado) {
        return ResponseEntity.ok(devolucionService.obtenerPorEstado(idEstado));
    }
    
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Devolucion>> obtenerPorUsuario(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(devolucionService.obtenerPorEstudiante(idUsuario));
    }
    
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DevolucionDetalle>> obtenerDetalles(@PathVariable Integer id) {
        return ResponseEntity.ok(devolucionService.obtenerDetalles(id));
    }
    
    @PostMapping
    public ResponseEntity<Devolucion> crear(@Valid @RequestBody Devolucion devolucion) {
        Devolucion nuevaDevolucion = devolucionService.guardar(devolucion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaDevolucion);
    }
    
    @PostMapping("/detalles")
    public ResponseEntity<DevolucionDetalle> agregarDetalle(@Valid @RequestBody DevolucionDetalle detalle) {
        DevolucionDetalle nuevoDetalle = devolucionService.agregarDetalle(detalle);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoDetalle);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Devolucion> actualizar(@PathVariable Integer id, @Valid @RequestBody Devolucion devolucion) {
        Devolucion devolucionActualizada = devolucionService.actualizar(id, devolucion);
        return ResponseEntity.ok(devolucionActualizada);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        devolucionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Aprobar una devolución
     * PATCH /api/devoluciones/{id}/aprobar
     */
    @PatchMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobar(@PathVariable Integer id) {
        try {
            Devolucion devolucionAprobada = devolucionService.aprobarDevolucion(id);
            return ResponseEntity.ok(devolucionAprobada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Rechazar una devolución
     * PATCH /api/devoluciones/{id}/rechazar
     * Body: { "motivo": "Los insumos no están completos" }
     */
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(
        @PathVariable Integer id,
        @RequestBody Map<String, String> body
    ) {
        try {
            String motivo = body.getOrDefault("motivo", "Sin motivo especificado");
            Devolucion devolucionRechazada = devolucionService.rechazarDevolucion(id, motivo);
            return ResponseEntity.ok(devolucionRechazada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/completa")
    public ResponseEntity<Boolean> verificarCompleta(@PathVariable Integer id) {
        try {
            boolean completa = devolucionService.esDevolucionCompleta(id);
            return ResponseEntity.ok(completa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(false);
        }
    }
    @GetMapping("/{id}/revisados")
    public ResponseEntity<Boolean> verificarRevisados(@PathVariable Integer id) {
        try {
            boolean todosRevisados = devolucionService.todosInsumosRevisados(id);
            return ResponseEntity.ok(todosRevisados);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(false);
        }
    }
}
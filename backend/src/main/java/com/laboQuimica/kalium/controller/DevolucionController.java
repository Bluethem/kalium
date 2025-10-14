package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Devolucion;
import com.laboQuimica.kalium.entity.DevolucionDetalle;
import com.laboQuimica.kalium.service.DevolucionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devoluciones")
@CrossOrigin(origins = "http://localhost:5173")
public class DevolucionController {
    
    @Autowired
    private DevolucionService devolucionService;
    
    @GetMapping
    public ResponseEntity<List<Devolucion>> obtenerTodas() {
        try {
            List<Devolucion> devoluciones = devolucionService.obtenerTodas();
            return ResponseEntity.ok(devoluciones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Devolucion> obtenerPorId(@PathVariable Integer id) {
        return devolucionService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<Devolucion>> obtenerPorPedido(@PathVariable Integer idPedido) {
        try {
            List<Devolucion> devoluciones = devolucionService.obtenerPorPedido(idPedido);
            return ResponseEntity.ok(devoluciones);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Devolucion>> obtenerPorEstado(@PathVariable Integer idEstado) {
        try {
            List<Devolucion> devoluciones = devolucionService.obtenerPorEstado(idEstado);
            return ResponseEntity.ok(devoluciones);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DevolucionDetalle>> obtenerDetalles(@PathVariable Integer id) {
        try {
            List<DevolucionDetalle> detalles = devolucionService.obtenerDetalles(id);
            return ResponseEntity.ok(detalles);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Devolucion devolucion) {
        try {
            Devolucion nuevaDevolucion = devolucionService.guardar(devolucion);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaDevolucion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear devolución: " + e.getMessage());
        }
    }
    
    @PostMapping("/detalles")
    public ResponseEntity<?> agregarDetalle(@RequestBody DevolucionDetalle detalle) {
        try {
            DevolucionDetalle nuevoDetalle = devolucionService.agregarDetalle(detalle);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoDetalle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al agregar detalle: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Devolucion devolucion) {
        try {
            Devolucion devolucionActualizada = devolucionService.actualizar(id, devolucion);
            return ResponseEntity.ok(devolucionActualizada);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar devolución: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            devolucionService.eliminar(id);
            return ResponseEntity.ok().body("Devolución eliminada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar devolución: " + e.getMessage());
        }
    }
}
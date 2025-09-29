package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.PedidoDetalle;
import com.laboQuimica.kalium.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {
    
    @Autowired
    private PedidoService pedidoService;
    
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodos() {
        return ResponseEntity.ok(pedidoService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPorId(@PathVariable Integer id) {
        return pedidoService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/instructor/{idInstructor}")
    public ResponseEntity<List<Pedido>> obtenerPorInstructor(@PathVariable Integer idInstructor) {
        try {
            return ResponseEntity.ok(pedidoService.obtenerPorInstructor(idInstructor));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Pedido>> obtenerPorEstado(@PathVariable Integer idEstado) {
        try {
            return ResponseEntity.ok(pedidoService.obtenerPorEstado(idEstado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<PedidoDetalle>> obtenerDetalles(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(pedidoService.obtenerDetallesPorPedido(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Pedido pedido) {
        try {
            Pedido nuevoPedido = pedidoService.guardar(pedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear pedido: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Pedido pedido) {
        try {
            Pedido pedidoActualizado = pedidoService.actualizar(id, pedido);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar pedido: " + e.getMessage());
        }
    }
    
    @PatchMapping("/{idPedido}/estado/{idEstado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer idPedido, @PathVariable Integer idEstado) {
        try {
            Pedido pedidoActualizado = pedidoService.cambiarEstado(idPedido, idEstado);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            pedidoService.eliminar(id);
            return ResponseEntity.ok().body("Pedido eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar pedido: " + e.getMessage());
        }
    }
}

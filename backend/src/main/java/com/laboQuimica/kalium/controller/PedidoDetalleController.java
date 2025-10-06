package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.PedidoDetalle;
import com.laboQuimica.kalium.service.PedidoDetalleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos-detalle")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoDetalleController {
    
    @Autowired
    private PedidoDetalleService pedidoDetalleService;
    
    @GetMapping
    public ResponseEntity<List<PedidoDetalle>> obtenerTodos() {
        return ResponseEntity.ok(pedidoDetalleService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PedidoDetalle> obtenerPorId(@PathVariable Integer id) {
        return pedidoDetalleService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PedidoDetalle pedidoDetalle) {
        try {
            PedidoDetalle nuevo = pedidoDetalleService.guardar(pedidoDetalle);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear detalle del pedido: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            pedidoDetalleService.eliminar(id);
            return ResponseEntity.ok().body("Detalle eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar detalle: " + e.getMessage());
        }
    }
}

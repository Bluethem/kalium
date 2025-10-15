package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.PedidoDetalle;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
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
            .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", id));
    }
    
    @GetMapping("/instructor/{idInstructor}")
    public ResponseEntity<List<Pedido>> obtenerPorInstructor(@PathVariable Integer idInstructor) {
        return ResponseEntity.ok(pedidoService.obtenerPorInstructor(idInstructor));
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<Pedido>> obtenerPorEstado(@PathVariable Integer idEstado) {
        return ResponseEntity.ok(pedidoService.obtenerPorEstado(idEstado));
    }
    
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<PedidoDetalle>> obtenerDetalles(@PathVariable Integer id) {
        return ResponseEntity.ok(pedidoService.obtenerDetallesPorPedido(id));
    }
    
    @PostMapping
    public ResponseEntity<Pedido> crear(@Valid @RequestBody Pedido pedido) {
        Pedido nuevoPedido = pedidoService.guardar(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Pedido> actualizar(@PathVariable Integer id, @Valid @RequestBody Pedido pedido) {
        Pedido pedidoActualizado = pedidoService.actualizar(id, pedido);
        return ResponseEntity.ok(pedidoActualizado);
    }
    
    @PatchMapping("/{idPedido}/estado/{idEstado}")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable Integer idPedido, @PathVariable Integer idEstado) {
        Pedido pedidoActualizado = pedidoService.cambiarEstado(idPedido, idEstado);
        return ResponseEntity.ok(pedidoActualizado);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        pedidoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

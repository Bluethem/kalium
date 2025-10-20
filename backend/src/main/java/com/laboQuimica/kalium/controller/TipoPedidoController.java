package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.TipoPedido;
import com.laboQuimica.kalium.repository.TipoPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-pedido")
public class TipoPedidoController {
    
    @Autowired
    private TipoPedidoRepository tipoPedidoRepository;
    
    @GetMapping
    public ResponseEntity<List<TipoPedido>> obtenerTodos() {
        return ResponseEntity.ok(tipoPedidoRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TipoPedido> obtenerPorId(@PathVariable Integer id) {
        return tipoPedidoRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<TipoPedido> crear(@RequestBody TipoPedido tipoPedido) {
        try {
            TipoPedido nuevoTipo = tipoPedidoRepository.save(tipoPedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TipoPedido> actualizar(@PathVariable Integer id, @RequestBody TipoPedido tipoPedido) {
        return tipoPedidoRepository.findById(id)
            .map(tipoExistente -> {
                tipoExistente.setNombrePedido(tipoPedido.getNombrePedido());
                TipoPedido tipoActualizado = tipoPedidoRepository.save(tipoExistente);
                return ResponseEntity.ok(tipoActualizado);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            tipoPedidoRepository.deleteById(id);
            return ResponseEntity.ok().body("Tipo de pedido eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar tipo de pedido: " + e.getMessage());
        }
    }
}
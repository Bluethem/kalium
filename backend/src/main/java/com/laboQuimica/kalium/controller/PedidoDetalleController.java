package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.PedidoDetalle;
import com.laboQuimica.kalium.repository.PedidoDetalleRepository;
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
    private PedidoDetalleRepository pedidoDetalleRepository;
    
    /**
     * Obtener todos los detalles de pedido
     * GET /api/pedidos-detalle
     */
    @GetMapping
    public ResponseEntity<List<PedidoDetalle>> obtenerTodos() {
        try {
            List<PedidoDetalle> detalles = pedidoDetalleRepository.findAll();
            return ResponseEntity.ok(detalles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener un detalle de pedido por ID
     * GET /api/pedidos-detalle/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PedidoDetalle> obtenerPorId(@PathVariable Integer id) {
        return pedidoDetalleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Crear un nuevo detalle de pedido
     * POST /api/pedidos-detalle
     * 
     * Body ejemplo:
     * {
     *   "cantInsumo": 10,
     *   "pedido": { "idPedido": 1 },
     *   "tipoInsumo": { "idTipoInsumo": 5 }
     * }
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PedidoDetalle pedidoDetalle) {
        try {
            // Validaciones básicas
            if (pedidoDetalle.getCantInsumo() == null || pedidoDetalle.getCantInsumo() <= 0) {
                return ResponseEntity.badRequest()
                    .body("La cantidad debe ser mayor a 0");
            }
            
            if (pedidoDetalle.getPedido() == null || pedidoDetalle.getPedido().getIdPedido() == null) {
                return ResponseEntity.badRequest()
                    .body("Debe especificar un pedido válido");
            }
            
            if (pedidoDetalle.getTipoInsumo() == null || pedidoDetalle.getTipoInsumo().getIdTipoInsumo() == null) {
                return ResponseEntity.badRequest()
                    .body("Debe especificar un tipo de insumo válido");
            }
            
            // Guardar el detalle
            PedidoDetalle nuevoDetalle = pedidoDetalleRepository.save(pedidoDetalle);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoDetalle);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear detalle de pedido: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar un detalle de pedido existente
     * PUT /api/pedidos-detalle/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody PedidoDetalle pedidoDetalle) {
        return pedidoDetalleRepository.findById(id)
            .map(detalleExistente -> {
                try {
                    // Actualizar campos
                    detalleExistente.setCantInsumo(pedidoDetalle.getCantInsumo());
                    
                    if (pedidoDetalle.getPedido() != null) {
                        detalleExistente.setPedido(pedidoDetalle.getPedido());
                    }
                    
                    if (pedidoDetalle.getTipoInsumo() != null) {
                        detalleExistente.setTipoInsumo(pedidoDetalle.getTipoInsumo());
                    }
                    
                    PedidoDetalle actualizado = pedidoDetalleRepository.save(detalleExistente);
                    return ResponseEntity.ok(actualizado);
                    
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al actualizar: " + e.getMessage());
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Eliminar un detalle de pedido
     * DELETE /api/pedidos-detalle/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            if (!pedidoDetalleRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            pedidoDetalleRepository.deleteById(id);
            return ResponseEntity.ok()
                .body("Detalle de pedido eliminado correctamente");
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar detalle de pedido: " + e.getMessage());
        }
    }
}
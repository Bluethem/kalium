package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.TipoPedido;
import com.laboQuimica.kalium.repository.TipoPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
}
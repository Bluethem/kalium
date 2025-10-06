package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.PedidoDetalle;
import com.laboQuimica.kalium.repository.PedidoDetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PedidoDetalleService {
    
    @Autowired
    private PedidoDetalleRepository pedidoDetalleRepository;
    
    public List<PedidoDetalle> obtenerTodos() {
        return pedidoDetalleRepository.findAll();
    }
    
    public Optional<PedidoDetalle> obtenerPorId(Integer id) {
        return pedidoDetalleRepository.findById(id);
    }
    
    public PedidoDetalle guardar(PedidoDetalle pedidoDetalle) {
        return pedidoDetalleRepository.save(pedidoDetalle);
    }
    
    public void eliminar(Integer id) {
        if (!pedidoDetalleRepository.existsById(id)) {
            throw new RuntimeException("PedidoDetalle no encontrado con ID: " + id);
        }
        pedidoDetalleRepository.deleteById(id);
    }
}

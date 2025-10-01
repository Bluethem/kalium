package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.*;
import com.laboQuimica.kalium.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EntregaService {
    
    @Autowired
    private EntregaRepository entregaRepository;
    
    @Autowired
    private EntregaInsumoRepository entregaInsumoRepository;
    
    @Autowired
    private EntregaQuimicoRepository entregaQuimicoRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private EstudianteRepository estudianteRepository;
    
    public List<Entrega> obtenerTodas() {
        return entregaRepository.findAll();
    }
    
    public Optional<Entrega> obtenerPorId(Integer id) {
        return entregaRepository.findById(id);
    }
    
    public List<Entrega> obtenerPorPedido(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
            .map(entregaRepository::findByPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
    }
    
    public List<Entrega> obtenerPorEstudiante(Integer idEstudiante) {
        return estudianteRepository.findById(idEstudiante)
            .map(entregaRepository::findByEstudiante)
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + idEstudiante));
    }
    
    public Entrega guardar(Entrega entrega) {
        return entregaRepository.save(entrega);
    }
    
    public Entrega actualizar(Integer id, Entrega entregaActualizada) {
        return entregaRepository.findById(id)
            .map(entrega -> {
                entrega.setHoraEntrega(entregaActualizada.getHoraEntrega());
                entrega.setPedido(entregaActualizada.getPedido());
                entrega.setEstudiante(entregaActualizada.getEstudiante());
                return entregaRepository.save(entrega);
            })
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + id));
    }
    
    public void eliminar(Integer id) {
        entregaRepository.deleteById(id);
    }
    
    // Métodos para EntregaInsumo
    public List<EntregaInsumo> obtenerInsumosPorEntrega(Integer idEntrega) {
        Entrega entrega = entregaRepository.findById(idEntrega)
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + idEntrega));
        return entregaInsumoRepository.findByEntrega(entrega);
    }
    
    public EntregaInsumo guardarEntregaInsumo(EntregaInsumo entregaInsumo) {
        return entregaInsumoRepository.save(entregaInsumo);
    }
    
    // Métodos para EntregaQuimico
    public List<EntregaQuimico> obtenerQuimicosPorEntrega(Integer idEntrega) {
        Entrega entrega = entregaRepository.findById(idEntrega)
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + idEntrega));
        return entregaQuimicoRepository.findByEntrega(entrega);
    }
    
    public EntregaQuimico guardarEntregaQuimico(EntregaQuimico entregaQuimico) {
        return entregaQuimicoRepository.save(entregaQuimico);
    }
}

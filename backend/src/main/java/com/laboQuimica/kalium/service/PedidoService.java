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
public class PedidoService {
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private PedidoDetalleRepository pedidoDetalleRepository;
    
    @Autowired
    private InstructorRepository instructorRepository;
    
    @Autowired
    private EstPedidoRepository estPedidoRepository;
    
    @Autowired
    private ReservaService reservaService;
    
    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAll();
    }
    
    public Optional<Pedido> obtenerPorId(Integer id) {
        return pedidoRepository.findById(id);
    }
    
    public List<Pedido> obtenerPorInstructor(Integer idInstructor) {
        return instructorRepository.findById(idInstructor)
            .map(pedidoRepository::findByInstructor)
            .orElseThrow(() -> new RuntimeException("Instructor no encontrado con id: " + idInstructor));
    }
    
    public List<Pedido> obtenerPorEstado(Integer idEstado) {
        return estPedidoRepository.findById(idEstado)
            .map(pedidoRepository::findByEstPedido)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
    }
    
    public Pedido guardar(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }
    
    public Pedido actualizar(Integer id, Pedido pedidoActualizado) {
        return pedidoRepository.findById(id)
            .map(pedido -> {
                pedido.setFechaPedido(pedidoActualizado.getFechaPedido());
                pedido.setCantGrupos(pedidoActualizado.getCantGrupos());
                pedido.setInstructor(pedidoActualizado.getInstructor());
                pedido.setEstPedido(pedidoActualizado.getEstPedido());
                pedido.setCurso(pedidoActualizado.getCurso());
                pedido.setTipoPedido(pedidoActualizado.getTipoPedido());
                pedido.setHorario(pedidoActualizado.getHorario());
                return pedidoRepository.save(pedido);
            })
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
    }
    
    public Pedido cambiarEstado(Integer idPedido, Integer idEstado) {
        // Si se está aprobando (estado 2), usar ReservaService
        if (idEstado == 2) {
            reservaService.aprobarPedido(idPedido);
            return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        }
        
        // Si se está cancelando (estado 5), usar ReservaService
        if (idEstado == 5) {
            reservaService.cancelarPedido(idPedido);
            return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        }
        
        // Si se está rechazando (estado 3), también cancelar reservas si las había
        if (idEstado == 3) {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
            
            // Si ya estaba aprobado, liberar reservas
            if (pedido.getEstPedido().getIdEstPedido() == 2) {
                reservaService.cancelarPedido(idPedido);
            }
            
            EstPedido estado = estPedidoRepository.findById(idEstado)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
            pedido.setEstPedido(estado);
            return pedidoRepository.save(pedido);
        }
        
        // Para otros estados, cambio normal
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        
        EstPedido estado = estPedidoRepository.findById(idEstado)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
        
        pedido.setEstPedido(estado);
        return pedidoRepository.save(pedido);
    }
    
    public void eliminar(Integer id) {
        pedidoRepository.deleteById(id);
    }
    
    public List<PedidoDetalle> obtenerDetallesPorPedido(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        return pedidoDetalleRepository.findByPedido(pedido);
    }
}

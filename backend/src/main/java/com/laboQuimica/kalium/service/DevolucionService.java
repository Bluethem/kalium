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
public class DevolucionService {
    
    @Autowired
    private DevolucionRepository devolucionRepository;
    
    @Autowired
    private DevolucionDetalleRepository devolucionDetalleRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private EstDevolucionRepository estDevolucionRepository;
    
    @Autowired
    private EntregaRepository entregaRepository;
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    /**
     * Obtener todas las devoluciones
     */
    public List<Devolucion> obtenerTodas() {
        return devolucionRepository.findAll();
    }
    
    /**
     * Obtener una devolución por ID
     */
    public Optional<Devolucion> obtenerPorId(Integer id) {
        return devolucionRepository.findById(id);
    }
    
    /**
     * Obtener devoluciones por pedido
     */
    public List<Devolucion> obtenerPorPedido(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
            .map(devolucionRepository::findByPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
    }
    
    /**
     * Obtener devoluciones por estado
     */
    public List<Devolucion> obtenerPorEstado(Integer idEstado) {
        return estDevolucionRepository.findById(idEstado)
            .map(devolucionRepository::findByEstDevolucion)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
    }
    
    /**
     * Crear una nueva devolución
     */
    public Devolucion guardar(Devolucion devolucion) {
        // Validaciones
        if (devolucion.getPedido() == null || devolucion.getPedido().getIdPedido() == null) {
            throw new RuntimeException("Debe especificar un pedido válido");
        }
        
        if (devolucion.getEntrega() == null || devolucion.getEntrega().getIdEntrega() == null) {
            throw new RuntimeException("Debe especificar una entrega válida");
        }
        
        if (devolucion.getEstDevolucion() == null || devolucion.getEstDevolucion().getIdEstDevolucion() == null) {
            throw new RuntimeException("Debe especificar un estado válido");
        }
        
        // Verificar que el pedido existe
        Pedido pedido = pedidoRepository.findById(devolucion.getPedido().getIdPedido())
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        // Verificar que la entrega existe
        Entrega entrega = entregaRepository.findById(devolucion.getEntrega().getIdEntrega())
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
        
        // Verificar que el estado existe
        EstDevolucion estado = estDevolucionRepository.findById(devolucion.getEstDevolucion().getIdEstDevolucion())
            .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        
        devolucion.setPedido(pedido);
        devolucion.setEntrega(entrega);
        devolucion.setEstDevolucion(estado);
        
        return devolucionRepository.save(devolucion);
    }
    
    /**
     * Actualizar una devolución existente
     */
    public Devolucion actualizar(Integer id, Devolucion devolucionActualizada) {
        return devolucionRepository.findById(id)
            .map(devolucion -> {
                if (devolucionActualizada.getFechaDevolucion() != null) {
                    devolucion.setFechaDevolucion(devolucionActualizada.getFechaDevolucion());
                }
                if (devolucionActualizada.getHoraDevolucion() != null) {
                    devolucion.setHoraDevolucion(devolucionActualizada.getHoraDevolucion());
                }
                if (devolucionActualizada.getPedido() != null) {
                    devolucion.setPedido(devolucionActualizada.getPedido());
                }
                if (devolucionActualizada.getEstDevolucion() != null) {
                    devolucion.setEstDevolucion(devolucionActualizada.getEstDevolucion());
                }
                if (devolucionActualizada.getEntrega() != null) {
                    devolucion.setEntrega(devolucionActualizada.getEntrega());
                }
                return devolucionRepository.save(devolucion);
            })
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + id));
    }
    
    /**
     * Eliminar una devolución
     */
    public void eliminar(Integer id) {
        if (!devolucionRepository.existsById(id)) {
            throw new RuntimeException("Devolución no encontrada con id: " + id);
        }
        
        // Eliminar primero los detalles
        Devolucion devolucion = devolucionRepository.findById(id).get();
        devolucionDetalleRepository.deleteAll(devolucionDetalleRepository.findByDevolucion(devolucion));
        
        // Eliminar la devolución
        devolucionRepository.deleteById(id);
    }
    
    /**
     * Obtener detalles de una devolución
     */
    public List<DevolucionDetalle> obtenerDetalles(Integer idDevolucion) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
        return devolucionDetalleRepository.findByDevolucion(devolucion);
    }
    
    /**
     * Agregar un insumo a una devolución
     */
    public DevolucionDetalle agregarDetalle(DevolucionDetalle detalle) {
        // Validaciones
        if (detalle.getDevolucion() == null || detalle.getDevolucion().getIdDevolucion() == null) {
            throw new RuntimeException("Debe especificar una devolución válida");
        }
        
        if (detalle.getInsumo() == null || detalle.getInsumo().getIdInsumo() == null) {
            throw new RuntimeException("Debe especificar un insumo válido");
        }
        
        // Verificar que la devolución existe
        Devolucion devolucion = devolucionRepository.findById(detalle.getDevolucion().getIdDevolucion())
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada"));
        
        // Verificar que el insumo existe
        Insumo insumo = insumoRepository.findById(detalle.getInsumo().getIdInsumo())
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        
        // Cambiar el estado del insumo de "En Uso" a "Disponible" (ID = 1)
        EstInsumo estadoDisponible = estInsumoRepository.findById(1)
            .orElseThrow(() -> new RuntimeException("Estado 'Disponible' no encontrado"));
        insumo.setEstInsumo(estadoDisponible);
        insumoRepository.save(insumo);
        
        detalle.setDevolucion(devolucion);
        detalle.setInsumo(insumo);
        
        return devolucionDetalleRepository.save(detalle);
    }
}
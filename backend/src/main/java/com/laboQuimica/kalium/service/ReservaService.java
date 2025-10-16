package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.*;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservaService.class);
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private PedidoDetalleRepository pedidoDetalleRepository;
    
    @Autowired
    private EstPedidoRepository estPedidoRepository;
    
    @Autowired
    private EstPedidoDetalleRepository estPedidoDetalleRepository;
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    /**
     * Aprobar pedido y reservar insumos
     */
    @Transactional
    public void aprobarPedido(Integer idPedido) {
        logger.info("Aprobando pedido {}", idPedido);
        
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", idPedido));
        
        // Verificar que esté pendiente
        if (pedido.getEstPedido().getIdEstPedido() != 1) {
            throw new IllegalStateException("Solo se pueden aprobar pedidos pendientes");
        }
        
        List<PedidoDetalle> detalles = pedidoDetalleRepository.findByPedido(pedido);
        
        // Estados
        EstPedidoDetalle estadoReservado = estPedidoDetalleRepository.findById(2)
            .orElseThrow(() -> new ResourceNotFoundException("EstPedidoDetalle", "id", 2));
        EstInsumo estadoInsumoReservado = estInsumoRepository.findById(5)
            .orElseThrow(() -> new ResourceNotFoundException("EstInsumo", "id", 5));
        EstInsumo estadoInsumoDisponible = estInsumoRepository.findById(1)
            .orElseThrow(() -> new ResourceNotFoundException("EstInsumo", "id", 1));
        
        for (PedidoDetalle detalle : detalles) {
            TipoInsumo tipoInsumo = detalle.getTipoInsumo();
            
            if (tipoInsumo.getEsQuimico()) {
                // ✅ QUÍMICOS: Solo cambiar estado del detalle (no se resta físicamente aún)
                detalle.setEstPedidoDetalle(estadoReservado);
                logger.info("Químico {} reservado (cantidad: {})", tipoInsumo.getNombreTipoInsumo(), detalle.getCantInsumo());
                
            } else {
                // ✅ INSUMOS FÍSICOS: Reservar unidades específicas
                int cantidadNecesaria = detalle.getCantInsumo();
                
                // Buscar insumos disponibles
                List<Insumo> insumosDisponibles = insumoRepository
                    .findByTipoInsumoAndEstInsumo(tipoInsumo, estadoInsumoDisponible)
                    .stream()
                    .limit(cantidadNecesaria)
                    .collect(Collectors.toList());
                
                if (insumosDisponibles.size() < cantidadNecesaria) {
                    throw new IllegalStateException(
                        String.format("Stock insuficiente de %s. Necesitas: %d, Disponibles: %d", 
                            tipoInsumo.getNombreTipoInsumo(), 
                            cantidadNecesaria, 
                            insumosDisponibles.size())
                    );
                }
                
                // Cambiar estado a "Reservado"
                for (Insumo insumo : insumosDisponibles) {
                    insumo.setEstInsumo(estadoInsumoReservado);
                    insumoRepository.save(insumo);
                    logger.info("Insumo físico ID {} reservado", insumo.getIdInsumo());
                }
                
                detalle.setEstPedidoDetalle(estadoReservado);
            }
            
            pedidoDetalleRepository.save(detalle);
        }
        
        // Cambiar estado del pedido a "Aprobado"
        EstPedido estadoAprobado = estPedidoRepository.findById(2)
            .orElseThrow(() -> new ResourceNotFoundException("EstPedido", "id", 2));
        pedido.setEstPedido(estadoAprobado);
        pedidoRepository.save(pedido);
        
        logger.info("Pedido {} aprobado exitosamente", idPedido);
    }
    
    /**
     * Cancelar pedido y liberar reservas
     */
    @Transactional
    public void cancelarPedido(Integer idPedido) {
        logger.info("Cancelando pedido {}", idPedido);
        
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", idPedido));
        
        List<PedidoDetalle> detalles = pedidoDetalleRepository.findByPedido(pedido);
        
        // Estados
        EstPedidoDetalle estadoCancelado = estPedidoDetalleRepository.findById(4)
            .orElseThrow(() -> new ResourceNotFoundException("EstPedidoDetalle", "id", 4));
        EstInsumo estadoInsumoDisponible = estInsumoRepository.findById(1)
            .orElseThrow(() -> new ResourceNotFoundException("EstInsumo", "id", 1));
        
        for (PedidoDetalle detalle : detalles) {
            // Solo liberar si estaba reservado
            if (detalle.getEstPedidoDetalle() != null && 
                detalle.getEstPedidoDetalle().getIdEstPedidoDetalle() == 2) {
                
                TipoInsumo tipoInsumo = detalle.getTipoInsumo();
                
                if (!tipoInsumo.getEsQuimico()) {
                    // ✅ INSUMOS FÍSICOS: Volver a estado "Disponible"
                    int cantidadALiberar = detalle.getCantInsumo();
                    
                    List<Insumo> insumosReservados = insumoRepository
                        .findReservadosByTipoInsumo(tipoInsumo.getIdTipoInsumo())
                        .stream()
                        .limit(cantidadALiberar)
                        .collect(Collectors.toList());
                    
                    for (Insumo insumo : insumosReservados) {
                        insumo.setEstInsumo(estadoInsumoDisponible);
                        insumoRepository.save(insumo);
                        logger.info("Insumo físico ID {} liberado", insumo.getIdInsumo());
                    }
                }
                // Los químicos no necesitan liberación física
                
                detalle.setEstPedidoDetalle(estadoCancelado);
                pedidoDetalleRepository.save(detalle);
            }
        }
        
        // Cambiar estado del pedido a "Cancelado"
        EstPedido estadoCancelado_pedido = estPedidoRepository.findById(5)
            .orElseThrow(() -> new ResourceNotFoundException("EstPedido", "id", 5));
        pedido.setEstPedido(estadoCancelado_pedido);
        pedidoRepository.save(pedido);
        
        logger.info("Pedido {} cancelado exitosamente", idPedido);
    }
    
    /**
     * Job programado para cancelar pedidos vencidos
     * Se ejecuta cada hora
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cancelarPedidosVencidos() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            logger.info("Ejecutando job de cancelación de pedidos vencidos: {}", ahora);
            
            List<Pedido> pedidosVencidos = pedidoRepository.findPedidosAprobadosVencidos(ahora);
            
            if (pedidosVencidos.isEmpty()) {
                logger.info("No hay pedidos vencidos");
                return;
            }
            
            logger.info("Encontrados {} pedidos vencidos", pedidosVencidos.size());
            
            for (Pedido pedido : pedidosVencidos) {
                try {
                    cancelarPedido(pedido.getIdPedido());
                    logger.info("Pedido {} cancelado automáticamente por vencimiento", pedido.getIdPedido());
                } catch (Exception e) {
                    logger.error("Error al cancelar pedido {} automáticamente", pedido.getIdPedido(), e);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error en job de cancelación de pedidos vencidos", e);
        }
    }
}

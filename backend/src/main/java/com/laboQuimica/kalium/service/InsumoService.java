package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.dto.TipoInsumoStockDTO;
import com.laboQuimica.kalium.entity.*;
import com.laboQuimica.kalium.exception.ResourceNotFoundException;
import com.laboQuimica.kalium.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InsumoService {
    
    private static final Logger logger = LoggerFactory.getLogger(InsumoService.class);
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private TipoInsumoRepository tipoInsumoRepository;
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private QuimicoRepository quimicoRepository;
    
    @Autowired
    private NotificacionService notificacionService;
    
    public List<Insumo> obtenerTodos() {
        return insumoRepository.findAll();
    }
    
    public Optional<Insumo> obtenerPorId(Integer id) {
        return insumoRepository.findById(id);
    }
    
    public List<Insumo> obtenerPorEstado(Integer idEstado) {
        return estInsumoRepository.findById(idEstado)
            .map(insumoRepository::findByEstInsumo)
            .orElseThrow(() -> new ResourceNotFoundException("EstadoInsumo", "id", idEstado));
    }
    
    public List<Insumo> obtenerPorTipo(Integer idTipo) {
        return tipoInsumoRepository.findById(idTipo)
            .map(insumoRepository::findByTipoInsumo)
            .orElseThrow(() -> new ResourceNotFoundException("TipoInsumo", "id", idTipo));
    }
    
    public Insumo guardar(Insumo insumo) {
        Insumo insumoGuardado = insumoRepository.save(insumo);
        
        // Verificar stock después de guardar
        verificarStockBajo(insumo.getTipoInsumo().getIdTipoInsumo());
        
        return insumoGuardado;
    }
    
    public Insumo actualizar(Integer id, Insumo insumoActualizado) {
        return insumoRepository.findById(id)
            .map(insumo -> {
                insumo.setEstInsumo(insumoActualizado.getEstInsumo());
                insumo.setTipoInsumo(insumoActualizado.getTipoInsumo());
                Insumo guardado = insumoRepository.save(insumo);
                
                // Verificar stock después de actualizar
                verificarStockBajo(guardado.getTipoInsumo().getIdTipoInsumo());
                
                return guardado;
            })
            .orElseThrow(() -> new ResourceNotFoundException("Insumo", "id", id));
    }
    
    public Insumo cambiarEstado(Integer idInsumo, Integer idEstado) {
        Insumo insumo = insumoRepository.findById(idInsumo)
            .orElseThrow(() -> new ResourceNotFoundException("Insumo", "id", idInsumo));
        
        EstInsumo estado = estInsumoRepository.findById(idEstado)
            .orElseThrow(() -> new ResourceNotFoundException("EstadoInsumo", "id", idEstado));
        
        insumo.setEstInsumo(estado);
        Insumo guardado = insumoRepository.save(insumo);
        
        // Verificar stock después de cambiar estado
        verificarStockBajo(guardado.getTipoInsumo().getIdTipoInsumo());
        
        return guardado;
    }
    
    public void eliminar(Integer id) {
        Optional<Insumo> insumoOpt = insumoRepository.findById(id);
        if (insumoOpt.isPresent()) {
            Integer idTipoInsumo = insumoOpt.get().getTipoInsumo().getIdTipoInsumo();
            insumoRepository.deleteById(id);
            
            // Verificar stock después de eliminar
            verificarStockBajo(idTipoInsumo);
        }
    }
    
    // Métodos para TipoInsumo
    public List<TipoInsumo> obtenerTodosTipos() {
        return tipoInsumoRepository.findAll();
    }
    
    public List<TipoInsumoStockDTO> obtenerTodosTiposConStock() {
        List<TipoInsumo> tipos = tipoInsumoRepository.findAll();
        
        return tipos.stream().map(tipo -> {
            TipoInsumoStockDTO dto = new TipoInsumoStockDTO();
            dto.setIdTipoInsumo(tipo.getIdTipoInsumo());
            dto.setNombreTipoInsumo(tipo.getNombreTipoInsumo());
            dto.setDescripcion(tipo.getDescripcion());
            dto.setCategoria(tipo.getCategoria());
            dto.setUnidad(tipo.getUnidad());
            dto.setEsQuimico(tipo.getEsQuimico());
            dto.setStockMinimo(tipo.getStockMinimo()); // NUEVO
            
            double stockActual = 0;
            
            if (tipo.getEsQuimico()) {
                // Para químicos: sumar cantidades
                Float cantidadTotal = quimicoRepository.sumCantidadByTipoInsumo(tipo.getIdTipoInsumo());
                if (cantidadTotal == null) cantidadTotal = 0.0f;
                dto.setCantidadTotal(String.format("%.2f", cantidadTotal));
                dto.setCantidadNumerica(cantidadTotal.doubleValue());
                stockActual = cantidadTotal.doubleValue();
            } else {
                // Para insumos: contar solo unidades DISPONIBLES (estado = 1)
                Long cantidad = insumoRepository.countDisponiblesByTipoInsumo(tipo.getIdTipoInsumo());
                if (cantidad == null) cantidad = 0L;
                dto.setCantidadTotal(cantidad.toString());
                dto.setCantidadNumerica(cantidad.doubleValue());
                stockActual = cantidad.doubleValue();
            }
            
            // NUEVO: Verificar si está en stock bajo
            dto.setStockBajo(stockActual < tipo.getStockMinimo());
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    public List<TipoInsumo> obtenerTiposPorCategoria(Integer idCategoria) {
        return categoriaRepository.findById(idCategoria)
            .map(tipoInsumoRepository::findByCategoria)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", idCategoria));
    }
    
    public TipoInsumo guardarTipo(TipoInsumo tipoInsumo) {
        return tipoInsumoRepository.save(tipoInsumo);
    }
    
    /**
     * Verificar si el stock de un tipo de insumo está bajo y crear notificaciones
     */
    private void verificarStockBajo(Integer idTipoInsumo) {
        try {
            TipoInsumo tipoInsumo = tipoInsumoRepository.findById(idTipoInsumo)
                .orElse(null);
            
            if (tipoInsumo == null) return;
            
            Integer stockMinimo = tipoInsumo.getStockMinimo();
            if (stockMinimo == null || stockMinimo <= 0) return;
            
            double stockActual = 0;
            String unidad = tipoInsumo.getUnidad().getUnidad();
            
            if (tipoInsumo.getEsQuimico()) {
                // Para químicos: sumar cantidades
                Float cantTotal = quimicoRepository.sumCantidadByTipoInsumo(idTipoInsumo);
                stockActual = (cantTotal != null) ? cantTotal.doubleValue() : 0.0;
            } else {
                // Para insumos: contar solo unidades disponibles (estado disponible = 1)
                Long cantidad = insumoRepository.countDisponiblesByTipoInsumo(idTipoInsumo);
                stockActual = (cantidad != null) ? cantidad.doubleValue() : 0.0;
            }
            
            // Si el stock está bajo el mínimo, crear notificación
            if (stockActual < stockMinimo) {
                String mensaje = String.format(
                    "Stock bajo: %s - Actual: %.2f %s / Mínimo: %d %s",
                    tipoInsumo.getNombreTipoInsumo(),
                    stockActual,
                    unidad,
                    stockMinimo,
                    unidad
                );
                
                notificacionService.crearNotificacionBajoStock(idTipoInsumo, mensaje);
            }
        } catch (Exception e) {
            // No fallar la operación principal si hay error en notificaciones
            logger.error("Error al verificar stock bajo para tipo {}", idTipoInsumo, e);
        }
    }
}
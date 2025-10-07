package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.Quimico;
import com.laboQuimica.kalium.entity.TipoInsumo;
import com.laboQuimica.kalium.repository.QuimicoRepository;
import com.laboQuimica.kalium.repository.TipoInsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QuimicoService {
    
    @Autowired
    private QuimicoRepository quimicoRepository;
    
    @Autowired
    private TipoInsumoRepository tipoInsumoRepository;
    
    @Autowired
    private NotificacionService notificacionService;
    
    public List<Quimico> obtenerTodos() {
        return quimicoRepository.findAll();
    }
    
    public Optional<Quimico> obtenerPorId(Integer id) {
        return quimicoRepository.findById(id);
    }
    
    public List<Quimico> obtenerPorTipo(Integer idTipo) {
        return tipoInsumoRepository.findById(idTipo)
            .map(quimicoRepository::findByTipoInsumo)
            .orElseThrow(() -> new RuntimeException("Tipo de insumo no encontrado con id: " + idTipo));
    }
    
    public Quimico guardar(Quimico quimico) {
        Quimico quimicoGuardado = quimicoRepository.save(quimico);
        
        // ✅ Verificar stock después de guardar
        verificarStockBajo(quimico.getTipoInsumo().getIdTipoInsumo());
        
        return quimicoGuardado;
    }
    
    public Quimico actualizar(Integer id, Quimico quimicoActualizado) {
        return quimicoRepository.findById(id)
            .map(quimico -> {
                quimico.setCantQuimico(quimicoActualizado.getCantQuimico());
                quimico.setTipoInsumo(quimicoActualizado.getTipoInsumo());
                quimico.setFechaIngreso(quimicoActualizado.getFechaIngreso());
                Quimico guardado = quimicoRepository.save(quimico);
                
                // ✅ Verificar stock después de actualizar
                verificarStockBajo(guardado.getTipoInsumo().getIdTipoInsumo());
                
                return guardado;
            })
            .orElseThrow(() -> new RuntimeException("Químico no encontrado con id: " + id));
    }
    
    public void eliminar(Integer id) {
        Optional<Quimico> quimicoOpt = quimicoRepository.findById(id);
        if (quimicoOpt.isPresent()) {
            Integer idTipoInsumo = quimicoOpt.get().getTipoInsumo().getIdTipoInsumo();
            quimicoRepository.deleteById(id);
            
            // ✅ Verificar stock después de eliminar
            verificarStockBajo(idTipoInsumo);
        }
    }
    
    /**
     * ✅ Verificar si el stock de un químico está bajo y crear notificaciones
     */
    private void verificarStockBajo(Integer idTipoInsumo) {
        try {
            TipoInsumo tipoInsumo = tipoInsumoRepository.findById(idTipoInsumo)
                .orElse(null);
            
            if (tipoInsumo == null || !tipoInsumo.getEsQuimico()) return;
            
            Integer stockMinimo = tipoInsumo.getStockMinimo();
            if (stockMinimo == null || stockMinimo <= 0) return;
            
            // Sumar cantidades de químicos
            Float cantTotal = quimicoRepository.sumCantidadByTipoInsumo(idTipoInsumo);
            double stockActual = (cantTotal != null) ? cantTotal.doubleValue() : 0.0;
            String unidad = tipoInsumo.getUnidad().getUnidad();
            
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
            System.err.println("Error al verificar stock bajo: " + e.getMessage());
        }
    }
}
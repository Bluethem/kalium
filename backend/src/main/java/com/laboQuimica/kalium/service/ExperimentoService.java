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
public class ExperimentoService {
    
    @Autowired
    private ExperimentoRepository experimentoRepository;
    
    @Autowired
    private DetalleExperimentoRepository detalleExperimentoRepository;
    
    @Autowired
    private TipoInsumoRepository tipoInsumoRepository;
    
    /**
     * Obtener todos los experimentos
     */
    public List<Experimento> obtenerTodos() {
        return experimentoRepository.findAll();
    }
    
    /**
     * Obtener un experimento por ID
     */
    public Optional<Experimento> obtenerPorId(Integer id) {
        return experimentoRepository.findById(id);
    }
    
    /**
     * Crear un nuevo experimento
     */
    public Experimento guardar(Experimento experimento) {
        // Validación
        if (experimento.getNombreExperimento() == null || experimento.getNombreExperimento().trim().isEmpty()) {
            throw new RuntimeException("El nombre del experimento es obligatorio");
        }
        
        return experimentoRepository.save(experimento);
    }
    
    /**
     * Actualizar un experimento existente
     */
    public Experimento actualizar(Integer id, Experimento experimentoActualizado) {
        return experimentoRepository.findById(id)
            .map(experimento -> {
                if (experimentoActualizado.getNombreExperimento() != null) {
                    experimento.setNombreExperimento(experimentoActualizado.getNombreExperimento());
                }
                return experimentoRepository.save(experimento);
            })
            .orElseThrow(() -> new RuntimeException("Experimento no encontrado con id: " + id));
    }
    
    /**
     * Eliminar un experimento
     */
    public void eliminar(Integer id) {
        if (!experimentoRepository.existsById(id)) {
            throw new RuntimeException("Experimento no encontrado con id: " + id);
        }
        
        // Eliminar primero los detalles
        Experimento experimento = experimentoRepository.findById(id).get();
        detalleExperimentoRepository.deleteAll(detalleExperimentoRepository.findByExperimento(experimento));
        
        // Eliminar el experimento
        experimentoRepository.deleteById(id);
    }
    
    /**
     * Obtener detalles de un experimento (insumos necesarios)
     */
    public List<DetalleExperimento> obtenerDetalles(Integer idExperimento) {
        Experimento experimento = experimentoRepository.findById(idExperimento)
            .orElseThrow(() -> new RuntimeException("Experimento no encontrado con id: " + idExperimento));
        return detalleExperimentoRepository.findByExperimento(experimento);
    }
    
    /**
     * Agregar un detalle (insumo) a un experimento
     */
    public DetalleExperimento agregarDetalle(DetalleExperimento detalle) {
        // Validaciones
        if (detalle.getExperimento() == null || detalle.getExperimento().getIdExperimento() == null) {
            throw new RuntimeException("Debe especificar un experimento válido");
        }
        
        if (detalle.getTipoInsumo() == null || detalle.getTipoInsumo().getIdTipoInsumo() == null) {
            throw new RuntimeException("Debe especificar un tipo de insumo válido");
        }
        
        if (detalle.getCantInsumoExperimento() == null || detalle.getCantInsumoExperimento() <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }
        
        // Verificar que el experimento existe
        Experimento experimento = experimentoRepository.findById(detalle.getExperimento().getIdExperimento())
            .orElseThrow(() -> new RuntimeException("Experimento no encontrado"));
        
        // Verificar que el tipo de insumo existe
        TipoInsumo tipoInsumo = tipoInsumoRepository.findById(detalle.getTipoInsumo().getIdTipoInsumo())
            .orElseThrow(() -> new RuntimeException("Tipo de insumo no encontrado"));
        
        detalle.setExperimento(experimento);
        detalle.setTipoInsumo(tipoInsumo);
        
        return detalleExperimentoRepository.save(detalle);
    }
    
    /**
     * Eliminar un detalle de experimento
     */
    public void eliminarDetalle(Integer idDetalle) {
        if (!detalleExperimentoRepository.existsById(idDetalle)) {
            throw new RuntimeException("Detalle no encontrado con id: " + idDetalle);
        }
        detalleExperimentoRepository.deleteById(idDetalle);
    }
}
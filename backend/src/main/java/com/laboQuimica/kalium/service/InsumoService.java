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
public class InsumoService {
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private TipoInsumoRepository tipoInsumoRepository;
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    public List<Insumo> obtenerTodos() {
        return insumoRepository.findAll();
    }
    
    public Optional<Insumo> obtenerPorId(Integer id) {
        return insumoRepository.findById(id);
    }
    
    public List<Insumo> obtenerPorEstado(Integer idEstado) {
        return estInsumoRepository.findById(idEstado)
            .map(insumoRepository::findByEstInsumo)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
    }
    
    public List<Insumo> obtenerPorTipo(Integer idTipo) {
        return tipoInsumoRepository.findById(idTipo)
            .map(insumoRepository::findByTipoInsumo)
            .orElseThrow(() -> new RuntimeException("Tipo de insumo no encontrado con id: " + idTipo));
    }
    
    public Insumo guardar(Insumo insumo) {
        return insumoRepository.save(insumo);
    }
    
    public Insumo actualizar(Integer id, Insumo insumoActualizado) {
        return insumoRepository.findById(id)
            .map(insumo -> {
                insumo.setEstInsumo(insumoActualizado.getEstInsumo());
                insumo.setTipoInsumo(insumoActualizado.getTipoInsumo());
                return insumoRepository.save(insumo);
            })
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado con id: " + id));
    }
    
    public Insumo cambiarEstado(Integer idInsumo, Integer idEstado) {
        Insumo insumo = insumoRepository.findById(idInsumo)
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado con id: " + idInsumo));
        
        EstInsumo estado = estInsumoRepository.findById(idEstado)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
        
        insumo.setEstInsumo(estado);
        return insumoRepository.save(insumo);
    }
    
    public void eliminar(Integer id) {
        insumoRepository.deleteById(id);
    }
    
    // Métodos para TipoInsumo
    public List<TipoInsumo> obtenerTodosTipos() {
        return tipoInsumoRepository.findAll();
    }
    
    public List<TipoInsumo> obtenerTiposPorCategoria(Integer idCategoria) {
        return categoriaRepository.findById(idCategoria)
            .map(tipoInsumoRepository::findByCategoria)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + idCategoria));
    }
    
    public TipoInsumo guardarTipo(TipoInsumo tipoInsumo) {
        return tipoInsumoRepository.save(tipoInsumo);
    }
}

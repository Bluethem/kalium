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
        return quimicoRepository.save(quimico);
    }
    
    public Quimico actualizar(Integer id, Quimico quimicoActualizado) {
        return quimicoRepository.findById(id)
            .map(quimico -> {
                quimico.setCantQuimico(quimicoActualizado.getCantQuimico());
                quimico.setTipoInsumo(quimicoActualizado.getTipoInsumo());
                quimico.setFechaIngreso(quimicoActualizado.getFechaIngreso());
                return quimicoRepository.save(quimico);
            })
            .orElseThrow(() -> new RuntimeException("Químico no encontrado con id: " + id));
    }
    
    public void eliminar(Integer id) {
        quimicoRepository.deleteById(id);
    }
}
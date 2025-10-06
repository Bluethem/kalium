package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.Horario;
import com.laboQuimica.kalium.repository.HorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class HorarioService {
    
    @Autowired
    private HorarioRepository horarioRepository;
    
    public List<Horario> obtenerTodos() {
        return horarioRepository.findAll();
    }
    
    public List<Horario> obtenerDisponibles() {
        return horarioRepository.findHorariosDisponibles();
    }
    
    public Optional<Horario> obtenerPorId(Integer id) {
        return horarioRepository.findById(id);
    }
    
    public Horario guardar(Horario horario) {
        return horarioRepository.save(horario);
    }
    
    public void eliminar(Integer id) {
        if (!horarioRepository.existsById(id)) {
            throw new RuntimeException("Horario no encontrado con ID: " + id);
        }
        horarioRepository.deleteById(id);
    }
}

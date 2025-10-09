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
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private QuimicoRepository quimicoRepository;
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    /**
     * Obtener todas las entregas
     */
    public List<Entrega> obtenerTodas() {
        return entregaRepository.findAll();
    }
    
    /**
     * Obtener una entrega por ID
     */
    public Optional<Entrega> obtenerPorId(Integer id) {
        return entregaRepository.findById(id);
    }
    
    /**
     * Obtener entregas por pedido
     */
    public List<Entrega> obtenerPorPedido(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
            .map(entregaRepository::findByPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
    }
    
    /**
     * Obtener entregas por estudiante
     */
    public List<Entrega> obtenerPorEstudiante(Integer idEstudiante) {
        return estudianteRepository.findById(idEstudiante)
            .map(entregaRepository::findByEstudiante)
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + idEstudiante));
    }
    
    /**
     * Crear una nueva entrega
     */
    public Entrega guardar(Entrega entrega) {
        // Validaciones
        if (entrega.getPedido() == null || entrega.getPedido().getIdPedido() == null) {
            throw new RuntimeException("Debe especificar un pedido válido");
        }
        
        if (entrega.getEstudiante() == null || entrega.getEstudiante().getIdEstudiante() == null) {
            throw new RuntimeException("Debe especificar un estudiante válido");
        }
        
        // Verificar que el pedido existe
        Pedido pedido = pedidoRepository.findById(entrega.getPedido().getIdPedido())
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        // Verificar que el estudiante existe
        Estudiante estudiante = estudianteRepository.findById(entrega.getEstudiante().getIdEstudiante())
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        
        entrega.setPedido(pedido);
        entrega.setEstudiante(estudiante);
        
        return entregaRepository.save(entrega);
    }
    
    /**
     * Actualizar una entrega existente
     */
    public Entrega actualizar(Integer id, Entrega entregaActualizada) {
        return entregaRepository.findById(id)
            .map(entrega -> {
                if (entregaActualizada.getFechaEntrega() != null) {
                    entrega.setFechaEntrega(entregaActualizada.getFechaEntrega());
                }
                if (entregaActualizada.getHoraEntrega() != null) {
                    entrega.setHoraEntrega(entregaActualizada.getHoraEntrega());
                }
                if (entregaActualizada.getPedido() != null) {
                    entrega.setPedido(entregaActualizada.getPedido());
                }
                if (entregaActualizada.getEstudiante() != null) {
                    entrega.setEstudiante(entregaActualizada.getEstudiante());
                }
                return entregaRepository.save(entrega);
            })
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + id));
    }
    
    /**
     * Eliminar una entrega
     */
    public void eliminar(Integer id) {
        if (!entregaRepository.existsById(id)) {
            throw new RuntimeException("Entrega no encontrada con id: " + id);
        }
        
        // Eliminar primero las relaciones
        Entrega entrega = entregaRepository.findById(id).get();
        entregaInsumoRepository.deleteAll(entregaInsumoRepository.findByEntrega(entrega));
        entregaQuimicoRepository.deleteAll(entregaQuimicoRepository.findByEntrega(entrega));
        
        // Eliminar la entrega
        entregaRepository.deleteById(id);
    }
    
    // ===== Métodos para EntregaInsumo =====
    
    /**
     * Obtener todos los insumos de una entrega
     */
    public List<EntregaInsumo> obtenerInsumosPorEntrega(Integer idEntrega) {
        Entrega entrega = entregaRepository.findById(idEntrega)
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + idEntrega));
        return entregaInsumoRepository.findByEntrega(entrega);
    }
    
    /**
     * Agregar un insumo a una entrega
     */
    public EntregaInsumo guardarEntregaInsumo(EntregaInsumo entregaInsumo) {
        // Validaciones
        if (entregaInsumo.getEntrega() == null || entregaInsumo.getEntrega().getIdEntrega() == null) {
            throw new RuntimeException("Debe especificar una entrega válida");
        }
        
        if (entregaInsumo.getInsumo() == null || entregaInsumo.getInsumo().getIdInsumo() == null) {
            throw new RuntimeException("Debe especificar un insumo válido");
        }
        
        // Verificar que la entrega existe
        Entrega entrega = entregaRepository.findById(entregaInsumo.getEntrega().getIdEntrega())
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
        
        // Verificar que el insumo existe
        Insumo insumo = insumoRepository.findById(entregaInsumo.getInsumo().getIdInsumo())
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        
        // Cambiar el estado del insumo a "En Uso" (ID = 2)
        EstInsumo estadoEnUso = estInsumoRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'En Uso' no encontrado"));
        insumo.setEstInsumo(estadoEnUso);
        insumoRepository.save(insumo);
        
        entregaInsumo.setEntrega(entrega);
        entregaInsumo.setInsumo(insumo);
        
        return entregaInsumoRepository.save(entregaInsumo);
    }
    
    /**
     * Eliminar un insumo de una entrega
     */
    public void eliminarEntregaInsumo(Integer id) {
        EntregaInsumo entregaInsumo = entregaInsumoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("EntregaInsumo no encontrada"));
        
        // Cambiar el estado del insumo de vuelta a "Disponible" (ID = 1)
        Insumo insumo = entregaInsumo.getInsumo();
        EstInsumo estadoDisponible = estInsumoRepository.findById(1)
            .orElseThrow(() -> new RuntimeException("Estado 'Disponible' no encontrado"));
        insumo.setEstInsumo(estadoDisponible);
        insumoRepository.save(insumo);
        
        entregaInsumoRepository.deleteById(id);
    }
    
    // ===== Métodos para EntregaQuimico =====
    
    /**
     * Obtener todos los químicos de una entrega
     */
    public List<EntregaQuimico> obtenerQuimicosPorEntrega(Integer idEntrega) {
        Entrega entrega = entregaRepository.findById(idEntrega)
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + idEntrega));
        return entregaQuimicoRepository.findByEntrega(entrega);
    }
    
    /**
     * Agregar un químico a una entrega
     */
    public EntregaQuimico guardarEntregaQuimico(EntregaQuimico entregaQuimico) {
        // Validaciones
        if (entregaQuimico.getEntrega() == null || entregaQuimico.getEntrega().getIdEntrega() == null) {
            throw new RuntimeException("Debe especificar una entrega válida");
        }
        
        if (entregaQuimico.getQuimico() == null || entregaQuimico.getQuimico().getIdQuimico() == null) {
            throw new RuntimeException("Debe especificar un químico válido");
        }
        
        // Verificar que la entrega existe
        Entrega entrega = entregaRepository.findById(entregaQuimico.getEntrega().getIdEntrega())
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
        
        // Verificar que el químico existe
        Quimico quimico = quimicoRepository.findById(entregaQuimico.getQuimico().getIdQuimico())
            .orElseThrow(() -> new RuntimeException("Químico no encontrado"));
        
        entregaQuimico.setEntrega(entrega);
        entregaQuimico.setQuimico(quimico);
        
        return entregaQuimicoRepository.save(entregaQuimico);
    }
    
    /**
     * Eliminar un químico de una entrega
     */
    public void eliminarEntregaQuimico(Integer id) {
        if (!entregaQuimicoRepository.existsById(id)) {
            throw new RuntimeException("EntregaQuimico no encontrada con id: " + id);
        }
        entregaQuimicoRepository.deleteById(id);
    }
}
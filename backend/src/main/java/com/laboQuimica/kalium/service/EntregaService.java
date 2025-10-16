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
    
    @Autowired
    private PedidoDetalleRepository pedidoDetalleRepository;
    
    @Autowired
    private EstPedidoDetalleRepository estPedidoDetalleRepository;
    
    @Autowired
    private EstPedidoRepository estPedidoRepository;
    
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
        
        // Verificar que el pedido existe
        Pedido pedido = pedidoRepository.findById(entrega.getPedido().getIdPedido())
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        entrega.setPedido(pedido);
        
        // Estudiante es OPCIONAL ahora (se puede asignar después)
        if (entrega.getEstudiante() != null && entrega.getEstudiante().getIdEstudiante() != null) {
            Estudiante estudiante = estudianteRepository.findById(entrega.getEstudiante().getIdEstudiante())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
            entrega.setEstudiante(estudiante);
        }
        
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
    
    // ===== NUEVO: Generación masiva de entregas por grupos =====
    
    /**
     * Genera entregas masivas para un pedido basándose en la cantidad de grupos
     * Si el pedido tiene 5 grupos, se crean 5 entregas vacías pendientes de asignar estudiante
     * 
     * @param idPedido ID del pedido aprobado
     * @return Lista de entregas creadas
     */
    @Transactional
    public List<Entrega> generarEntregasPorGrupos(Integer idPedido) {
        // Obtener el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        
        // Verificar que el pedido esté aprobado o en preparación
        Integer estadoPedido = pedido.getEstPedido().getIdEstPedido();
        if (estadoPedido != 2 && estadoPedido != 3) {
            throw new RuntimeException("Solo se pueden generar entregas para pedidos aprobados o en preparación");
        }
        
        // Verificar que no existan entregas ya generadas
        List<Entrega> entregasExistentes = entregaRepository.findByPedido(pedido);
        if (!entregasExistentes.isEmpty()) {
            throw new RuntimeException("Ya existen entregas generadas para este pedido");
        }
        
        // Obtener la cantidad de grupos
        int cantidadGrupos = pedido.getCantGrupos();
        
        // Preparar fecha y hora de entrega del horario
        java.time.LocalDate fechaEntrega = pedido.getHorario().getFechaEntrega();
        java.time.LocalDateTime horaEntrega = pedido.getHorario().getHoraInicio();
        
        // Obtener insumos y químicos reservados para este pedido
        EstInsumo estadoReservado = estInsumoRepository.findById(5)
            .orElseThrow(() -> new RuntimeException("Estado 'Reservado' no encontrado"));
        EstInsumo estadoEnUso = estInsumoRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'En Uso' no encontrado"));
        
        // Obtener todos los insumos físicos reservados para el pedido
        List<Insumo> insumosReservados = insumoRepository.findByEstInsumo(estadoReservado);
        
        // Filtrar solo los que pertenecen a este pedido (verificando PedidoDetalle)
        List<PedidoDetalle> detalles = pedidoDetalleRepository.findByPedido(pedido);
        java.util.Map<Integer, Integer> cantidadPorTipoInsumo = new java.util.HashMap<>();
        
        for (PedidoDetalle detalle : detalles) {
            Integer idTipoInsumo = detalle.getTipoInsumo().getIdTipoInsumo();
            Integer cantidad = detalle.getCantInsumo();
            cantidadPorTipoInsumo.put(idTipoInsumo, cantidad * cantidadGrupos); // Total necesario
        }
        
        // Crear N entregas (una por grupo)
        java.util.List<Entrega> entregasCreadas = new java.util.ArrayList<>();
        
        for (int i = 0; i < cantidadGrupos; i++) {
            Entrega entrega = new Entrega();
            entrega.setFechaEntrega(fechaEntrega);
            entrega.setHoraEntrega(horaEntrega);
            entrega.setPedido(pedido);
            // Estudiante se asignará después
            
            // Guardar la entrega
            Entrega entregaGuardada = entregaRepository.save(entrega);
            
            // Asignar insumos a esta entrega
            for (PedidoDetalle detalle : detalles) {
                if (!detalle.getTipoInsumo().getEsQuimico()) {
                    // Es un insumo físico
                    int cantidadNecesaria = detalle.getCantInsumo();
                    int asignados = 0;
                    
                    for (Insumo insumo : insumosReservados) {
                        if (asignados >= cantidadNecesaria) break;
                        
                        if (insumo.getTipoInsumo().getIdTipoInsumo().equals(detalle.getTipoInsumo().getIdTipoInsumo())
                            && insumo.getEstInsumo().getIdEstInsumo().equals(5)) { // Aún reservado
                            
                            // Crear EntregaInsumo
                            EntregaInsumo entregaInsumo = new EntregaInsumo();
                            entregaInsumo.setEntrega(entregaGuardada);
                            entregaInsumo.setInsumo(insumo);
                            entregaInsumoRepository.save(entregaInsumo);
                            
                            // Cambiar estado a "En Uso"
                            insumo.setEstInsumo(estadoEnUso);
                            insumoRepository.save(insumo);
                            
                            asignados++;
                        }
                    }
                }
            }
            
            entregasCreadas.add(entregaGuardada);
        }
        
        // Marcar detalles del pedido como "Entregado" (estado 3)
        EstPedidoDetalle estadoEntregado = estPedidoDetalleRepository.findById(3)
            .orElseThrow(() -> new RuntimeException("Estado 'Entregado' no encontrado"));
        
        for (PedidoDetalle detalle : detalles) {
            detalle.setEstPedidoDetalle(estadoEntregado);
            pedidoDetalleRepository.save(detalle);
        }
        
        // Cambiar estado del pedido a "Entregado" (estado 4)
        EstPedido estadoPedidoEntregado = estPedidoRepository.findById(4)
            .orElseThrow(() -> new RuntimeException("Estado 'Entregado' no encontrado"));
        pedido.setEstPedido(estadoPedidoEntregado);
        pedidoRepository.save(pedido);
        
        return entregasCreadas;
    }
    
    /**
     * Asigna un estudiante a una entrega específica
     * 
     * @param idEntrega ID de la entrega
     * @param idEstudiante ID del estudiante
     * @return Entrega actualizada
     */
    @Transactional
    public Entrega asignarEstudianteAEntrega(Integer idEntrega, Integer idEstudiante) {
        Entrega entrega = entregaRepository.findById(idEntrega)
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada con id: " + idEntrega));
        
        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + idEstudiante));
        
        entrega.setEstudiante(estudiante);
        return entregaRepository.save(entrega);
    }
    
    /**
     * Verifica si un pedido ya tiene entregas generadas
     */
    public boolean pedidoTieneEntregas(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        return !entregaRepository.findByPedido(pedido).isEmpty();
    }
    
    /**
     * Obtiene entregas pendientes de asignar estudiante
     */
    public List<Entrega> obtenerEntregasSinEstudiante(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        
        return entregaRepository.findByPedido(pedido).stream()
            .filter(e -> e.getEstudiante() == null)
            .collect(java.util.stream.Collectors.toList());
    }
}
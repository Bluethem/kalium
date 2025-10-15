package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.*;
import com.laboQuimica.kalium.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PedidoService {
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private PedidoDetalleRepository pedidoDetalleRepository;
    
    @Autowired
    private InstructorRepository instructorRepository;
    
    @Autowired
    private EstPedidoRepository estPedidoRepository;
    
    @Autowired
    private ReservaService reservaService;
    
    @Autowired
    private ExperimentoRepository experimentoRepository;
    
    @Autowired
    private DetalleExperimentoRepository detalleExperimentoRepository;
    
    @Autowired
    private HorarioRepository horarioRepository;
    
    @Autowired
    private TipoPedidoRepository tipoPedidoRepository;
    
    @Autowired
    private EstPedidoDetalleRepository estPedidoDetalleRepository;
    
    @Autowired
    private CursoRepository cursoRepository;
    
    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAll();
    }
    
    public Optional<Pedido> obtenerPorId(Integer id) {
        return pedidoRepository.findById(id);
    }
    
    public List<Pedido> obtenerPorInstructor(Integer idInstructor) {
        return instructorRepository.findById(idInstructor)
            .map(pedidoRepository::findByInstructor)
            .orElseThrow(() -> new RuntimeException("Instructor no encontrado con id: " + idInstructor));
    }
    
    public List<Pedido> obtenerPorEstado(Integer idEstado) {
        return estPedidoRepository.findById(idEstado)
            .map(pedidoRepository::findByEstPedido)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
    }
    
    public Pedido guardar(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }
    
    public Pedido actualizar(Integer id, Pedido pedidoActualizado) {
        return pedidoRepository.findById(id)
            .map(pedido -> {
                pedido.setFechaPedido(pedidoActualizado.getFechaPedido());
                pedido.setCantGrupos(pedidoActualizado.getCantGrupos());
                pedido.setInstructor(pedidoActualizado.getInstructor());
                pedido.setEstPedido(pedidoActualizado.getEstPedido());
                pedido.setCurso(pedidoActualizado.getCurso());
                pedido.setTipoPedido(pedidoActualizado.getTipoPedido());
                pedido.setHorario(pedidoActualizado.getHorario());
                return pedidoRepository.save(pedido);
            })
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
    }
    
    public Pedido cambiarEstado(Integer idPedido, Integer idEstado) {
        // Si se está aprobando (estado 2), usar ReservaService
        if (idEstado == 2) {
            reservaService.aprobarPedido(idPedido);
            return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        }
        
        // Si se está cancelando (estado 5), usar ReservaService
        if (idEstado == 5) {
            reservaService.cancelarPedido(idPedido);
            return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        }
        
        // Si se está rechazando (estado 3), también cancelar reservas si las había
        if (idEstado == 3) {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
            
            // Si ya estaba aprobado, liberar reservas
            if (pedido.getEstPedido().getIdEstPedido() == 2) {
                reservaService.cancelarPedido(idPedido);
            }
            
            EstPedido estado = estPedidoRepository.findById(idEstado)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
            pedido.setEstPedido(estado);
            return pedidoRepository.save(pedido);
        }
        
        // Para otros estados, cambio normal
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        
        EstPedido estado = estPedidoRepository.findById(idEstado)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
        
        pedido.setEstPedido(estado);
        return pedidoRepository.save(pedido);
    }
    
    public void eliminar(Integer id) {
        pedidoRepository.deleteById(id);
    }
    
    public List<PedidoDetalle> obtenerDetallesPorPedido(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
        return pedidoDetalleRepository.findByPedido(pedido);
    }
    
    /**
     * Generar pedido automáticamente desde un experimento
     */
    public Pedido generarPedidoDesdeExperimento(Integer idExperimento, 
                                                Integer idInstructor,
                                                Integer idHorario,
                                                Integer idCurso,
                                                Integer cantGrupos) {
        // 1. Validar experimento
        Experimento experimento = experimentoRepository.findById(idExperimento)
            .orElseThrow(() -> new RuntimeException("Experimento no encontrado"));
        
        // 2. Obtener detalles del experimento (insumos necesarios)
        List<DetalleExperimento> detalles = detalleExperimentoRepository
            .findByExperimento(experimento);
        
        if (detalles.isEmpty()) {
            throw new RuntimeException("El experimento no tiene insumos definidos");
        }
        
        // 3. Validar instructor
        Instructor instructor = instructorRepository.findById(idInstructor)
            .orElseThrow(() -> new RuntimeException("Instructor no encontrado"));
        
        // 4. Validar horario
        Horario horario = horarioRepository.findById(idHorario)
            .orElseThrow(() -> new RuntimeException("Horario no encontrado"));
        
        // 5. Validar curso
        Curso curso = cursoRepository.findById(idCurso)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // 6. Validar número de grupos
        if (cantGrupos == null || cantGrupos <= 0) {
            throw new RuntimeException("El número de grupos debe ser mayor a 0");
        }
        
        // 7. Crear pedido
        Pedido pedido = new Pedido();
        pedido.setFechaPedido(LocalDate.now());
        pedido.setInstructor(instructor);
        pedido.setHorario(horario);
        pedido.setCurso(curso);
        pedido.setCantGrupos(cantGrupos);
        
        // Estado inicial: Creado (ID=1)
        EstPedido estadoCreado = estPedidoRepository.findById(1)
            .orElseThrow(() -> new RuntimeException("Estado 'Creado' no encontrado"));
        pedido.setEstPedido(estadoCreado);
        
        // Tipo: Experimento de Investigación (ID=2)
        TipoPedido tipoExperimento = tipoPedidoRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Tipo 'Experimento de Investigación' no encontrado"));
        pedido.setTipoPedido(tipoExperimento);
        
        // Guardar pedido
        pedido = pedidoRepository.save(pedido);
        
        // 8. Crear detalles del pedido (PedidoDetalle)
        for (DetalleExperimento detalle : detalles) {
            PedidoDetalle pedidoDetalle = new PedidoDetalle();
            pedidoDetalle.setPedido(pedido);
            pedidoDetalle.setTipoInsumo(detalle.getTipoInsumo());
            
            // Cantidad = cantidad por experimento × número de grupos
            Integer cantidadTotal = detalle.getCantInsumoExperimento() * cantGrupos;
            pedidoDetalle.setCantInsumo(cantidadTotal);
            
            // Estado inicial: Creado (ID=1)
            EstPedidoDetalle estadoDetalleCreado = estPedidoDetalleRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado detalle 'Creado' no encontrado"));
            pedidoDetalle.setEstPedidoDetalle(estadoDetalleCreado);
            
            pedidoDetalleRepository.save(pedidoDetalle);
        }
        
        return pedido;
    }
}

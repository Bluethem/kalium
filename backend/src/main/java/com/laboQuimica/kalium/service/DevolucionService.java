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
public class DevolucionService {
    
    @Autowired
    private DevolucionRepository devolucionRepository;
    
    @Autowired
    private DevolucionDetalleRepository devolucionDetalleRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private EstDevolucionRepository estDevolucionRepository;
    
    @Autowired
    private EntregaRepository entregaRepository;
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private EstInsumoRepository estInsumoRepository;
    
    @Autowired
    private IncidenteService incidenteService;
    
    @Autowired
    private EntregaInsumoRepository entregaInsumoRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;
    
    @Autowired
    private EstIncidenteRepository estIncidenteRepository;
    
    /**
     * Obtener todas las devoluciones
     */
    public List<Devolucion> obtenerTodas() {
        return devolucionRepository.findAll();
    }
    
    /**
     * Obtener una devolución por ID
     */
    public Optional<Devolucion> obtenerPorId(Integer id) {
        return devolucionRepository.findById(id);
    }
    
    /**
     * Obtener devoluciones por pedido
     */
    public List<Devolucion> obtenerPorPedido(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
            .map(devolucionRepository::findByPedido)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + idPedido));
    }
    
    /**
     * Obtener devoluciones por estado
     */
    public List<Devolucion> obtenerPorEstado(Integer idEstado) {
        return estDevolucionRepository.findById(idEstado)
            .map(devolucionRepository::findByEstDevolucion)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
    }
    
    /**
     * Obtener devoluciones por estudiante
     */
    public List<Devolucion> obtenerPorEstudiante(Integer idUsuario) {
        return devolucionRepository.findAll().stream()
            .filter(d -> d.getEntrega() != null 
                && d.getEntrega().getEstudiante() != null
                && d.getEntrega().getEstudiante().getUsuario() != null
                && d.getEntrega().getEstudiante().getUsuario().getIdUsuario().equals(idUsuario))
            .toList();
    }
    
    /**
     * Guardar o actualizar una devolución
     */
    public Devolucion guardar(Devolucion devolucion) {
        // Validaciones básicas
        if (devolucion.getPedido() == null || devolucion.getPedido().getIdPedido() == null) {
            throw new RuntimeException("Debe especificar un pedido válido");
        }
        
        if (devolucion.getEntrega() == null || devolucion.getEntrega().getIdEntrega() == null) {
            throw new RuntimeException("Debe especificar una entrega válida");
        }
        
        // Verificar que el pedido existe
        pedidoRepository.findById(devolucion.getPedido().getIdPedido())
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        // Verificar que la entrega existe
        entregaRepository.findById(devolucion.getEntrega().getIdEntrega())
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
        
        // Si no tiene estado, asignar "Pendiente" (ID 1)
        if (devolucion.getEstDevolucion() == null) {
            EstDevolucion estadoPendiente = estDevolucionRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado 'Pendiente' no encontrado"));
            devolucion.setEstDevolucion(estadoPendiente);
        }
        
        return devolucionRepository.save(devolucion);
    }
    
    /**
     * Actualizar una devolución
     */
    public Devolucion actualizar(Integer id, Devolucion devolucionActualizada) {
        return devolucionRepository.findById(id)
            .map(devolucion -> {
                if (devolucionActualizada.getFechaDevolucion() != null) {
                    devolucion.setFechaDevolucion(devolucionActualizada.getFechaDevolucion());
                }
                if (devolucionActualizada.getHoraDevolucion() != null) {
                    devolucion.setHoraDevolucion(devolucionActualizada.getHoraDevolucion());
                }
                if (devolucionActualizada.getEstDevolucion() != null) {
                    devolucion.setEstDevolucion(devolucionActualizada.getEstDevolucion());
                }
                return devolucionRepository.save(devolucion);
            })
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + id));
    }
    
    /**
     * Eliminar una devolución
     */
    public void eliminar(Integer id) {
        if (!devolucionRepository.existsById(id)) {
            throw new RuntimeException("Devolución no encontrada con id: " + id);
        }
        
        Devolucion devolucion = devolucionRepository.findById(id).get();
        
        // Eliminar primero los detalles
        devolucionDetalleRepository.deleteAll(devolucionDetalleRepository.findByDevolucion(devolucion));
        
        // Eliminar la devolución
        devolucionRepository.deleteById(id);
    }
    
    /**
     * Obtener detalles de una devolución
     */
    public List<DevolucionDetalle> obtenerDetalles(Integer idDevolucion) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
        return devolucionDetalleRepository.findByDevolucion(devolucion);
    }
    
    /**
     * ✅ ACTUALIZADO: Agregar un insumo a una devolución
     * El admin revisa y marca el estado, pero NO cambia el estado del insumo hasta aprobar
     */
    public DevolucionDetalle agregarDetalle(DevolucionDetalle detalle) {
        // Validaciones
        if (detalle.getDevolucion() == null || detalle.getDevolucion().getIdDevolucion() == null) {
            throw new RuntimeException("Debe especificar una devolución válida");
        }
        
        if (detalle.getInsumo() == null || detalle.getInsumo().getIdInsumo() == null) {
            throw new RuntimeException("Debe especificar un insumo válido");
        }
        
        // Verificar que la devolución existe y está PENDIENTE
        Devolucion devolucion = devolucionRepository.findById(detalle.getDevolucion().getIdDevolucion())
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada"));
        
        if (devolucion.getEstDevolucion().getIdEstDevolucion() != 1) {
            throw new RuntimeException("Solo se pueden agregar detalles a devoluciones PENDIENTES");
        }
        
        // Verificar que el insumo existe
        Insumo insumo = insumoRepository.findById(detalle.getInsumo().getIdInsumo())
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        
        // ✅ Si no se especifica estado, dejar como NO_REVISADO
        String estadoDevuelto = detalle.getEstadoInsumoDevuelto();
        if (estadoDevuelto == null || estadoDevuelto.trim().isEmpty()) {
            estadoDevuelto = "NO_REVISADO";
            detalle.setEstadoInsumoDevuelto(estadoDevuelto);
        }
        
        detalle.setDevolucion(devolucion);
        detalle.setInsumo(insumo);
        
        // ✅ Guardar el detalle SIN cambiar estado del insumo aún
        DevolucionDetalle detalleGuardado = devolucionDetalleRepository.save(detalle);
        
        // ✅ SOLO generar incidencias si hay daños (pero NO cambiar estado todavía)
        if ("DAÑADO".equalsIgnoreCase(estadoDevuelto) || "FALTANTE".equalsIgnoreCase(estadoDevuelto)) {
            generarIncidenciaAutomatica(devolucion, insumo, estadoDevuelto, detalle.getObservaciones());
        }
        
        System.out.println("📝 Detalle guardado - Insumo ID " + insumo.getIdInsumo() + " marcado como: " + estadoDevuelto);
        System.out.println("⏳ Estado del insumo NO cambiará hasta que se APRUEBE la devolución");
        
        return detalleGuardado;
    }
    
    /**
     * ✅ Generar incidencia automática cuando hay daño o faltante
     */
    private void generarIncidenciaAutomatica(Devolucion devolucion, Insumo insumo, String tipoIncidencia, String observaciones) {
        try {
            Incidentes incidente = new Incidentes();
            
            // Obtener estado "Reportado" (ID 1)
            EstIncidente estadoReportado = estIncidenteRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado 'Reportado' no encontrado"));
            incidente.setEstIncidente(estadoReportado);
            
            // Construir descripción
            String descripcion = String.format(
                "INCIDENCIA AUTOMÁTICA: Insumo %s (ID: %s) reportado como %s. %s",
                insumo.getTipoInsumo().getNombreTipoInsumo(),
                insumo.getIdInsumo(),
                tipoIncidencia,
                observaciones != null ? observaciones : "Sin observaciones adicionales"
            );
            
            incidente.setDescripcion(descripcion);
            incidente.setFechaIncidente(java.time.LocalDate.now());
            incidente.setDevolucion(devolucion);
            
            // Obtener estudiante desde la entrega
            if (devolucion.getEntrega() != null && devolucion.getEntrega().getEstudiante() != null) {
                incidente.setEstudiante(devolucion.getEntrega().getEstudiante());
            }
            
            // Guardar usando el servicio (incluye notificaciones)
            incidenteService.guardar(incidente);
            
            System.out.println("✅ Incidencia generada automáticamente: ID " + incidente.getIdIncidentes());
            
        } catch (Exception e) {
            System.err.println("⚠️ Error al generar incidencia automática: " + e.getMessage());
        }
    }

    /**
     * ✅ ACTUALIZADO: Aprobar una devolución
     * - Verifica que TODOS los insumos estén revisados
     * - AQUÍ es donde cambian los estados de los insumos
     * - Cambia estado a "Aprobada" (ID 2)
     * - Notifica al estudiante
     */
    @Transactional
    public Devolucion aprobarDevolucion(Integer idDevolucion) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
        
        // Verificar que esté en estado Pendiente
        if (devolucion.getEstDevolucion().getIdEstDevolucion() != 1) {
            throw new RuntimeException("Solo se pueden aprobar devoluciones en estado PENDIENTE");
        }
        
        // Verificar que TODOS los insumos estén revisados
        List<DevolucionDetalle> detalles = devolucionDetalleRepository.findByDevolucion(devolucion);
        
        if (detalles.isEmpty()) {
            throw new RuntimeException("No hay insumos registrados en esta devolución");
        }
        
        boolean hayNoRevisados = detalles.stream()
            .anyMatch(d -> "NO_REVISADO".equalsIgnoreCase(d.getEstadoInsumoDevuelto()));
        
        if (hayNoRevisados) {
            throw new RuntimeException("No se puede aprobar: aún hay insumos sin revisar (NO_REVISADO)");
        }
        
        // ✅ NUEVO: Cambiar estados de insumos según revisión
        System.out.println("🔄 Iniciando actualización de estados de insumos...");
        
        for (DevolucionDetalle detalle : detalles) {
            Insumo insumo = detalle.getInsumo();
            String estadoRevision = detalle.getEstadoInsumoDevuelto();
            
            if ("OK".equalsIgnoreCase(estadoRevision)) {
                // Liberar insumo → "Disponible" (ID 1)
                EstInsumo estadoDisponible = estInsumoRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Estado 'Disponible' no encontrado"));
                insumo.setEstInsumo(estadoDisponible);
                insumoRepository.save(insumo);
                
                System.out.println("✅ Insumo ID " + insumo.getIdInsumo() + " liberado a DISPONIBLE");
                
            } else if ("DAÑADO".equalsIgnoreCase(estadoRevision)) {
                // Marcar como dañado → "Dañado" (ID 3)
                EstInsumo estadoDaniado = estInsumoRepository.findById(3)
                    .orElseThrow(() -> new RuntimeException("Estado 'Dañado' no encontrado"));
                insumo.setEstInsumo(estadoDaniado);
                insumoRepository.save(insumo);
                
                System.out.println("⚠️ Insumo ID " + insumo.getIdInsumo() + " marcado como DAÑADO");
                
            } else if ("FALTANTE".equalsIgnoreCase(estadoRevision)) {
                // Marcar como perdido → "Perdido" (ID 4)
                EstInsumo estadoPerdido = estInsumoRepository.findById(4)
                    .orElseThrow(() -> new RuntimeException("Estado 'Perdido' no encontrado"));
                insumo.setEstInsumo(estadoPerdido);
                insumoRepository.save(insumo);
                
                System.out.println("❌ Insumo ID " + insumo.getIdInsumo() + " marcado como FALTANTE/PERDIDO");
            }
        }
        
        // Cambiar estado de devolución a Aprobada (ID 2)
        EstDevolucion estadoAprobada = estDevolucionRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'Aprobada' no encontrado"));
        devolucion.setEstDevolucion(estadoAprobada);
        
        Devolucion devolucionGuardada = devolucionRepository.save(devolucion);
        
        // Notificar al estudiante
        notificarEstudianteDevolucionAprobada(devolucion);
        
        System.out.println("✅ Devolución ID " + idDevolucion + " APROBADA - Estados de insumos actualizados correctamente");
        
        return devolucionGuardada;
    }

    /**
     * ✅ ACTUALIZADO: Rechazar una devolución
     * - Los insumos siguen en "En Uso" (el estudiante los mantiene)
     * - Cambia estado a "Rechazada" (ID 3)
     * - Notifica al estudiante
     */
    @Transactional
    public Devolucion rechazarDevolucion(Integer idDevolucion, String motivo) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
        
        // Verificar que esté en estado Pendiente
        if (devolucion.getEstDevolucion().getIdEstDevolucion() != 1) {
            throw new RuntimeException("Solo se pueden rechazar devoluciones en estado PENDIENTE");
        }
        
        // Cambiar estado a Rechazada (ID 3)
        EstDevolucion estadoRechazada = estDevolucionRepository.findById(3)
            .orElseThrow(() -> new RuntimeException("Estado 'Rechazada' no encontrado"));
        devolucion.setEstDevolucion(estadoRechazada);
        
        // ✅ IMPORTANTE: Asegurar que los insumos sigan en "En Uso"
        // El estudiante se queda con ellos porque la devolución fue rechazada
        List<DevolucionDetalle> detalles = devolucionDetalleRepository.findByDevolucion(devolucion);
        EstInsumo estadoEnUso = estInsumoRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'En Uso' no encontrado"));
        
        for (DevolucionDetalle detalle : detalles) {
            Insumo insumo = detalle.getInsumo();
            // Solo asegurar que siga en "En Uso"
            if (insumo.getEstInsumo().getIdEstInsumo() != 2) {
                insumo.setEstInsumo(estadoEnUso);
                insumoRepository.save(insumo);
                System.out.println("🔄 Insumo ID " + insumo.getIdInsumo() + " restaurado a EN USO");
            }
        }
        
        Devolucion devolucionGuardada = devolucionRepository.save(devolucion);
        
        // Notificar al estudiante
        notificarEstudianteDevolucionRechazada(devolucion, motivo);
        
        System.out.println("❌ Devolución ID " + idDevolucion + " RECHAZADA - Insumos siguen EN USO");
        
        return devolucionGuardada;
    }
    
    /**
     * Notificar al estudiante que su devolución fue aprobada
     */
    private void notificarEstudianteDevolucionAprobada(Devolucion devolucion) {
        try {
            if (devolucion.getEntrega() != null && 
                devolucion.getEntrega().getEstudiante() != null &&
                devolucion.getEntrega().getEstudiante().getUsuario() != null) {
                
                Usuario estudiante = devolucion.getEntrega().getEstudiante().getUsuario();
                
                Notificacion notif = new Notificacion();
                notif.setTitulo("Devolución Aprobada");
                notif.setMensaje(String.format(
                    "Tu devolución #DEV%03d ha sido APROBADA. Los insumos han sido procesados correctamente.",
                    devolucion.getIdDevolucion()
                ));
                notif.setTipo("DEVOLUCION_APROBADA");
                notif.setLeida(false);
                notif.setUsuario(estudiante);
                notif.setFechaCreacion(java.time.LocalDateTime.now());
                
                notificacionRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Error al crear notificación de aprobación: " + e.getMessage());
        }
    }
    
    /**
     * Notificar al estudiante que su devolución fue rechazada
     */
    private void notificarEstudianteDevolucionRechazada(Devolucion devolucion, String motivo) {
        try {
            if (devolucion.getEntrega() != null && 
                devolucion.getEntrega().getEstudiante() != null &&
                devolucion.getEntrega().getEstudiante().getUsuario() != null) {
                
                Usuario estudiante = devolucion.getEntrega().getEstudiante().getUsuario();
                
                Notificacion notif = new Notificacion();
                notif.setTitulo("Devolución Rechazada");
                notif.setMensaje(String.format(
                    "Tu devolución #DEV%03d ha sido RECHAZADA. Motivo: %s. Los insumos siguen asignados a ti.",
                    devolucion.getIdDevolucion(),
                    motivo != null && !motivo.isEmpty() ? motivo : "No especificado"
                ));
                notif.setTipo("DEVOLUCION_RECHAZADA");
                notif.setLeida(false);
                notif.setUsuario(estudiante);
                notif.setFechaCreacion(java.time.LocalDateTime.now());
                
                notificacionRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Error al crear notificación de rechazo: " + e.getMessage());
        }
    }

    /**
     * Verificar si una devolución está completa (todos los insumos devueltos)
     */
    public boolean esDevolucionCompleta(Integer idDevolucion) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada"));
        
        // Obtener insumos de la entrega
        Entrega entrega = devolucion.getEntrega();
        List<EntregaInsumo> insumosEntrega = entregaInsumoRepository.findByEntrega(entrega);
        
        // Obtener insumos devueltos
        List<DevolucionDetalle> insumosDevueltos = devolucionDetalleRepository.findByDevolucion(devolucion);
        
        // Comparar cantidades
        return insumosEntrega.size() == insumosDevueltos.size();
    }
    
    /**
     * Verificar si todos los insumos están revisados (ninguno en NO_REVISADO)
     */
    public boolean todosInsumosRevisados(Integer idDevolucion) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada"));
        
        List<DevolucionDetalle> detalles = devolucionDetalleRepository.findByDevolucion(devolucion);
        
        if (detalles.isEmpty()) {
            return false;
        }
        
        return detalles.stream()
            .noneMatch(d -> "NO_REVISADO".equalsIgnoreCase(d.getEstadoInsumoDevuelto()));
    }
}
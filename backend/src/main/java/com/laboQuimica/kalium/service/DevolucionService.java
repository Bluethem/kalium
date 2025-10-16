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
    public List<Devolucion> obtenerPorEstudiante(Integer idEstudiante) {
        return devolucionRepository.findByEstudiante(idEstudiante);
    }
    
    /**
     * Crear una nueva devolución
     */
    public Devolucion guardar(Devolucion devolucion) {
        // Validaciones
        if (devolucion.getPedido() == null || devolucion.getPedido().getIdPedido() == null) {
            throw new RuntimeException("Debe especificar un pedido válido");
        }
        
        if (devolucion.getEntrega() == null || devolucion.getEntrega().getIdEntrega() == null) {
            throw new RuntimeException("Debe especificar una entrega válida");
        }
        
        if (devolucion.getEstDevolucion() == null || devolucion.getEstDevolucion().getIdEstDevolucion() == null) {
            throw new RuntimeException("Debe especificar un estado válido");
        }
        
        // Verificar que el pedido existe
        Pedido pedido = pedidoRepository.findById(devolucion.getPedido().getIdPedido())
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        // Verificar que la entrega existe
        Entrega entrega = entregaRepository.findById(devolucion.getEntrega().getIdEntrega())
            .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
        
        // Verificar que el estado existe
        EstDevolucion estado = estDevolucionRepository.findById(devolucion.getEstDevolucion().getIdEstDevolucion())
            .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        
        devolucion.setPedido(pedido);
        devolucion.setEntrega(entrega);
        devolucion.setEstDevolucion(estado);
        
        return devolucionRepository.save(devolucion);
    }
    
    /**
     * Actualizar una devolución existente
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
                if (devolucionActualizada.getPedido() != null) {
                    devolucion.setPedido(devolucionActualizada.getPedido());
                }
                if (devolucionActualizada.getEstDevolucion() != null) {
                    devolucion.setEstDevolucion(devolucionActualizada.getEstDevolucion());
                }
                if (devolucionActualizada.getEntrega() != null) {
                    devolucion.setEntrega(devolucionActualizada.getEntrega());
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
        
        // Eliminar primero los detalles
        Devolucion devolucion = devolucionRepository.findById(id).get();
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
     * Agregar un insumo a una devolución
     * NUEVO: Maneja estados OK/Dañado y genera incidencias automáticamente
     */
    public DevolucionDetalle agregarDetalle(DevolucionDetalle detalle) {
        // Validaciones
        if (detalle.getDevolucion() == null || detalle.getDevolucion().getIdDevolucion() == null) {
            throw new RuntimeException("Debe especificar una devolución válida");
        }
        
        if (detalle.getInsumo() == null || detalle.getInsumo().getIdInsumo() == null) {
            throw new RuntimeException("Debe especificar un insumo válido");
        }
        
        // Verificar que la devolución existe
        Devolucion devolucion = devolucionRepository.findById(detalle.getDevolucion().getIdDevolucion())
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada"));
        
        // Verificar que el insumo existe
        Insumo insumo = insumoRepository.findById(detalle.getInsumo().getIdInsumo())
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        
        // Determinar el estado del insumo según el estado devuelto
        String estadoDevuelto = detalle.getEstadoInsumoDevuelto();
        if (estadoDevuelto == null || estadoDevuelto.trim().isEmpty()) {
            estadoDevuelto = "OK"; // Por defecto
            detalle.setEstadoInsumoDevuelto(estadoDevuelto);
        }
        
        // Cambiar estado del insumo según condición
        if ("OK".equalsIgnoreCase(estadoDevuelto)) {
            // Insumo devuelto en buen estado → Disponible (ID = 1)
            EstInsumo estadoDisponible = estInsumoRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado 'Disponible' no encontrado"));
            insumo.setEstInsumo(estadoDisponible);
            
        } else if ("Dañado".equalsIgnoreCase(estadoDevuelto) || "Perdido".equalsIgnoreCase(estadoDevuelto)) {
            // Insumo dañado o perdido → No Disponible (ID = 3)
            // No contará en stock ni inventario disponible
            EstInsumo estadoNoDisponible = estInsumoRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Estado 'No Disponible' no encontrado"));
            insumo.setEstInsumo(estadoNoDisponible);
            
            // ✅ Generar incidencia automáticamente
            generarIncidenciaPorDanio(devolucion, insumo, detalle.getObservaciones());
        }
        
        insumoRepository.save(insumo);
        
        // Eliminar el registro de EntregaInsumo (ya no está en uso)
        Entrega entrega = devolucion.getEntrega();
        entregaInsumoRepository.findByEntrega(entrega).stream()
            .filter(ei -> ei.getInsumo().getIdInsumo().equals(insumo.getIdInsumo()))
            .forEach(entregaInsumoRepository::delete);
        
        detalle.setDevolucion(devolucion);
        detalle.setInsumo(insumo);
        
        return devolucionDetalleRepository.save(detalle);
    }
    
    /**
     * Genera una incidencia automáticamente cuando se detecta un daño
     */
    private void generarIncidenciaPorDanio(Devolucion devolucion, Insumo insumo, String observaciones) {
        try {
            Incidentes incidente = new Incidentes();
            
            // Descripción automática
            String descripcion = String.format(
                "Insumo dañado en devolución: %s (ID: %d). %s",
                insumo.getTipoInsumo().getNombreTipoInsumo(),
                insumo.getIdInsumo(),
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
            // No lanzar excepción para no bloquear la devolución
        }
    }

    /**
     * Aprobar una devolución
     * - Cambia estado a "Aprobada" (ID 2)
     * - Los insumos ya fueron liberados en agregarDetalle()
     * - Notifica al estudiante
     */
    @Transactional
    public Devolucion aprobarDevolucion(Integer idDevolucion) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
        
        // Verificar que esté en estado Pendiente
        if (devolucion.getEstDevolucion().getIdEstDevolucion() != 1) {
            throw new RuntimeException("Solo se pueden aprobar devoluciones en estado Pendiente");
        }
        
        // Cambiar estado a Aprobada (ID 2)
        EstDevolucion estadoAprobada = estDevolucionRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'Aprobada' no encontrado"));
        devolucion.setEstDevolucion(estadoAprobada);
        
        Devolucion devolucionGuardada = devolucionRepository.save(devolucion);
        
        // Notificar al estudiante
        notificarEstudianteDevolucionAprobada(devolucion);
        
        return devolucionGuardada;
    }

    /**
     * Rechazar una devolución
     * - Cambia estado a "Rechazada" (ID 3)
     * - Revierte estados de insumos a "En Uso" (ID 2)
     * - Notifica al estudiante con el motivo
     */
    @Transactional
    public Devolucion rechazarDevolucion(Integer idDevolucion, String motivo) {
        Devolucion devolucion = devolucionRepository.findById(idDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
        
        // Verificar que esté en estado Pendiente
        if (devolucion.getEstDevolucion().getIdEstDevolucion() != 1) {
            throw new RuntimeException("Solo se pueden rechazar devoluciones en estado Pendiente");
        }
        
        // Cambiar estado a Rechazada (ID 3)
        EstDevolucion estadoRechazada = estDevolucionRepository.findById(3)
            .orElseThrow(() -> new RuntimeException("Estado 'Rechazada' no encontrado"));
        devolucion.setEstDevolucion(estadoRechazada);
        
        // Revertir estados de insumos a "En Uso" (ID 2)
        List<DevolucionDetalle> detalles = devolucionDetalleRepository.findByDevolucion(devolucion);
        EstInsumo estadoEnUso = estInsumoRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'En Uso' no encontrado"));
        
        for (DevolucionDetalle detalle : detalles) {
            Insumo insumo = detalle.getInsumo();
            insumo.setEstInsumo(estadoEnUso);
            insumoRepository.save(insumo);
        }
        
        Devolucion devolucionGuardada = devolucionRepository.save(devolucion);
        
        // Notificar al estudiante con el motivo
        notificarEstudianteDevolucionRechazada(devolucion, motivo);
        
        return devolucionGuardada;
    }

    /**
     * Métodos privados para notificaciones
     */
    private void notificarEstudianteDevolucionAprobada(Devolucion devolucion) {
        try {
            if (devolucion.getEntrega() != null && 
                devolucion.getEntrega().getEstudiante() != null &&
                devolucion.getEntrega().getEstudiante().getUsuario() != null) {
                
                Usuario estudiante = devolucion.getEntrega().getEstudiante().getUsuario();
                
                Notificacion notif = new Notificacion();
                notif.setTitulo("Devolución Aprobada ✓");
                notif.setMensaje("Tu devolución #DEV" + String.format("%03d", devolucion.getIdDevolucion()) + 
                                " ha sido aprobada por el administrador.");
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

    private void notificarEstudianteDevolucionRechazada(Devolucion devolucion, String motivo) {
        try {
            if (devolucion.getEntrega() != null && 
                devolucion.getEntrega().getEstudiante() != null &&
                devolucion.getEntrega().getEstudiante().getUsuario() != null) {
                
                Usuario estudiante = devolucion.getEntrega().getEstudiante().getUsuario();
                
                Notificacion notif = new Notificacion();
                notif.setTitulo("Devolución Rechazada ✗");
                notif.setMensaje("Tu devolución #DEV" + String.format("%03d", devolucion.getIdDevolucion()) + 
                                " fue rechazada. Motivo: " + (motivo != null && !motivo.isEmpty() ? motivo : "No especificado"));
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
}
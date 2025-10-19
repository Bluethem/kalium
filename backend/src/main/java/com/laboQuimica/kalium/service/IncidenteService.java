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
public class IncidenteService {
    
    @Autowired
    private IncidentesRepository incidentesRepository;
    
    @Autowired
    private EstIncidenteRepository estIncidenteRepository;
    
    @Autowired
    private DevolucionRepository devolucionRepository;
    
    @Autowired
    private NotificacionService notificacionService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;
    
    /**
     * Obtener todos los incidentes ordenados por fecha descendente
     */
    public List<Incidentes> obtenerTodos() {
        return incidentesRepository.findAllByOrderByFechaIncidenteDesc();
    }
    
    /**
     * Obtener un incidente por ID
     */
    public Optional<Incidentes> obtenerPorId(Integer id) {
        return incidentesRepository.findById(id);
    }
    
    /**
     * Obtener incidentes por estado
     */
    public List<Incidentes> obtenerPorEstado(Integer idEstado) {
        return estIncidenteRepository.findById(idEstado)
            .map(incidentesRepository::findByEstIncidenteOrderByFechaIncidenteDesc)
            .orElseThrow(() -> new RuntimeException("Estado de incidente no encontrado con id: " + idEstado));
    }
    
    /**
     * ✅ MODIFICADO: Obtener incidentes por IDUsuario del estudiante
     */
    public List<Incidentes> obtenerPorEstudiante(Integer idUsuario) {
        return incidentesRepository.findByEstudianteUsuarioIdUsuario(idUsuario);
    }
    
    /**
     * Obtener incidentes por devolución
     */
    public List<Incidentes> obtenerPorDevolucion(Integer idDevolucion) {
        return devolucionRepository.findById(idDevolucion)
            .map(incidentesRepository::findByDevolucion)
            .orElseThrow(() -> new RuntimeException("Devolución no encontrada con id: " + idDevolucion));
    }
    
    /**
     * Crear un nuevo incidente
     */
    public Incidentes guardar(Incidentes incidente) {
        // Validaciones básicas
        if (incidente.getDescripcion() == null || incidente.getDescripcion().trim().isEmpty()) {
            throw new RuntimeException("La descripción del incidente es obligatoria");
        }
        
        if (incidente.getFechaIncidente() == null) {
            incidente.setFechaIncidente(LocalDate.now());
        }
        
        // Si no se especifica estado, usar "Reportado" (ID 1)
        if (incidente.getEstIncidente() == null) {
            EstIncidente estadoReportado = estIncidenteRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado 'Reportado' no encontrado"));
            incidente.setEstIncidente(estadoReportado);
        }
        
        Incidentes incidenteGuardado = incidentesRepository.save(incidente);
        
        // ✅ Crear notificación para administradores de laboratorio
        crearNotificacionIncidente(incidenteGuardado);
        
        return incidenteGuardado;
    }
    
    /**
     * Actualizar un incidente existente
     */
    public Incidentes actualizar(Integer id, Incidentes incidenteActualizado) {
        return incidentesRepository.findById(id)
            .map(incidente -> {
                if (incidenteActualizado.getDescripcion() != null) {
                    incidente.setDescripcion(incidenteActualizado.getDescripcion());
                }
                if (incidenteActualizado.getFechaIncidente() != null) {
                    incidente.setFechaIncidente(incidenteActualizado.getFechaIncidente());
                }
                if (incidenteActualizado.getFechaSolucion() != null) {
                    incidente.setFechaSolucion(incidenteActualizado.getFechaSolucion());
                }
                if (incidenteActualizado.getEstIncidente() != null) {
                    incidente.setEstIncidente(incidenteActualizado.getEstIncidente());
                }
                if (incidenteActualizado.getDevolucion() != null) {
                    incidente.setDevolucion(incidenteActualizado.getDevolucion());
                }
                if (incidenteActualizado.getEstudiante() != null) {
                    incidente.setEstudiante(incidenteActualizado.getEstudiante());
                }
                
                return incidentesRepository.save(incidente);
            })
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + id));
    }
    
    /**
     * Cambiar el estado de un incidente
     */
    public Incidentes cambiarEstado(Integer idIncidente, Integer idEstado) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + idIncidente));
        
        EstIncidente nuevoEstado = estIncidenteRepository.findById(idEstado)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
        
        Integer estadoActual = incidente.getEstIncidente().getIdEstIncidente();
        
        // ✅ VALIDACIONES DE TRANSICIONES
        
        // No se puede cambiar un incidente RESUELTO
        if (estadoActual == 3) {
            throw new RuntimeException("No se puede cambiar el estado de un incidente RESUELTO");
        }
        
        // Si intenta poner en RESUELTO, debe estar EN REVISIÓN
        if (idEstado == 3 && estadoActual != 2) {
            throw new RuntimeException("Solo se pueden resolver incidentes que estén EN REVISIÓN");
        }
        
        // Si intenta poner EN REVISIÓN, debe estar REPORTADO
        if (idEstado == 2 && estadoActual != 1) {
            throw new RuntimeException("Solo se pueden poner en revisión incidentes REPORTADOS");
        }
        
        incidente.setEstIncidente(nuevoEstado);
        
        // Si cambia a RESUELTO, establecer fecha de solución
        if (idEstado == 3 && incidente.getFechaSolucion() == null) {
            incidente.setFechaSolucion(LocalDate.now());
        }
        
        System.out.println("🔄 Incidente ID " + idIncidente + " cambió a estado: " + nuevoEstado.getEstadoIncidente());
        
        return incidentesRepository.save(incidente);
    }
    
    /**
     * Cerrar/resolver un incidente
     */
    public Incidentes resolverIncidente(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + idIncidente));
        
        // ✅ NUEVO: Validar que esté EN REVISIÓN
        if (incidente.getEstIncidente().getIdEstIncidente() != 2) {
            throw new RuntimeException("Solo se pueden resolver incidentes que estén EN REVISIÓN. Primero debe ponerlo en revisión.");
        }
        
        EstIncidente estadoResuelto = estIncidenteRepository.findById(3)
            .orElseThrow(() -> new RuntimeException("Estado 'Resuelto' no encontrado"));
        
        incidente.setEstIncidente(estadoResuelto);
        incidente.setFechaSolucion(LocalDate.now());
        
        System.out.println("✅ Incidente ID " + idIncidente + " RESUELTO");
        
        // ✅ Notificar al estudiante
        notificarEstudianteIncidenteResuelto(incidente);
        
        return incidentesRepository.save(incidente);
    }
    
    /**
     * Eliminar un incidente
     */
    public void eliminar(Integer id) {
        incidentesRepository.deleteById(id);
    }
    
    /**
     * Obtener todos los estados de incidente
     */
    public List<EstIncidente> obtenerTodosEstados() {
        return estIncidenteRepository.findAll();
    }
    
    /**
     * Crear notificación cuando se reporta un incidente
     */
    private void crearNotificacionIncidente(Incidentes incidente) {
        try {
            // Obtener todos los administradores de laboratorio
            List<Usuario> administradores = usuarioRepository.findByRol_NombreRol("ADMIN_LABORATORIO");
            
            String nombreEstudiante = incidente.getEstudiante() != null && incidente.getEstudiante().getUsuario() != null
                ? incidente.getEstudiante().getUsuario().getNombre() + " " + incidente.getEstudiante().getUsuario().getApellido()
                : "Desconocido";
            
            String mensaje = String.format(
                "El estudiante %s reportó: %s",
                nombreEstudiante,
                incidente.getDescripcion()
            );
            
            for (Usuario admin : administradores) {
                Notificacion notificacion = new Notificacion();
                notificacion.setTitulo("Incidente reportado");
                notificacion.setMensaje(mensaje);
                notificacion.setTipo("INCIDENTE");
                notificacion.setLeida(false);
                notificacion.setUsuario(admin);
                
                // Datos extra en JSON
                String datosExtra = String.format(
                    "{\"idIncidente\": %d, \"idEstudiante\": %d, \"nombreEstudiante\": \"%s\"}",
                    incidente.getIdIncidentes(),
                    incidente.getEstudiante() != null ? incidente.getEstudiante().getIdEstudiante() : 0,
                    nombreEstudiante
                );
                notificacion.setDatosExtra(datosExtra);
                
                notificacionService.guardar(notificacion);
            }
        } catch (Exception e) {
            System.err.println("Error al crear notificación de incidente: " + e.getMessage());
        }
    }

    /**
     * Cambiar incidente a "En Revisión"
    */
    public Incidentes ponerEnRevision(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + idIncidente));
        
        // ✅ Validar que esté en estado REPORTADO
        if (incidente.getEstIncidente().getIdEstIncidente() != 1) {
            throw new RuntimeException("Solo se puede poner en revisión incidentes en estado REPORTADO");
        }
        
        EstIncidente estadoRevision = estIncidenteRepository.findById(2)
            .orElseThrow(() -> new RuntimeException("Estado 'En Revisión' no encontrado"));
        
        incidente.setEstIncidente(estadoRevision);
        
        System.out.println("🔍 Incidente ID " + idIncidente + " puesto EN REVISIÓN");
        
        return incidentesRepository.save(incidente);
    }

    /**
     * Cancelar un incidente
     */
    public Incidentes cancelarIncidente(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + idIncidente));
        
        // ✅ Validar que NO esté resuelto
        Integer estadoActual = incidente.getEstIncidente().getIdEstIncidente();
        if (estadoActual == 3) { // Resuelto
            throw new RuntimeException("No se puede cancelar un incidente que ya está RESUELTO");
        }
        
        // Solo permitir desde REPORTADO (1) o EN REVISIÓN (2)
        if (estadoActual != 1 && estadoActual != 2) {
            throw new RuntimeException("Solo se pueden cancelar incidentes en estado REPORTADO o EN REVISIÓN");
        }
        
        EstIncidente estadoCancelado = estIncidenteRepository.findById(4)
            .orElseThrow(() -> new RuntimeException("Estado 'Cancelado' no encontrado"));
        
        incidente.setEstIncidente(estadoCancelado);
        
        System.out.println("❌ Incidente ID " + idIncidente + " CANCELADO");
        
        return incidentesRepository.save(incidente);
    }

    private void notificarEstudianteIncidenteResuelto(Incidentes incidente) {
        try {
            if (incidente.getEstudiante() != null && 
                incidente.getEstudiante().getUsuario() != null) {
                
                Usuario estudiante = incidente.getEstudiante().getUsuario();
                
                Notificacion notif = new Notificacion();
                notif.setTitulo("Incidencia Resuelta");
                notif.setMensaje(String.format(
                    "La incidencia #INC%03d ha sido RESUELTA: %s",
                    incidente.getIdIncidentes(),
                    incidente.getDescripcion()
                ));
                notif.setTipo("INCIDENCIA_RESUELTA");
                notif.setLeida(false);
                notif.setUsuario(estudiante);
                notif.setFechaCreacion(java.time.LocalDateTime.now());
                
                notificacionRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Error al crear notificación de incidencia resuelta: " + e.getMessage());
        }
    }

    public boolean puedeResolver(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        
        // Solo puede resolverse si está EN REVISIÓN (ID 2)
        return incidente.getEstIncidente().getIdEstIncidente() == 2;
    }

    public boolean puedePonerEnRevision(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        
        // Solo puede ponerse en revisión si está REPORTADO (ID 1)
        return incidente.getEstIncidente().getIdEstIncidente() == 1;
    }
}
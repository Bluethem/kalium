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
        
        EstIncidente estado = estIncidenteRepository.findById(idEstado)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado con id: " + idEstado));
        
        incidente.setEstIncidente(estado);
        
        // Si el nuevo estado es "Resuelto" (ID 3), establecer fecha de solución
        if (idEstado == 3 && incidente.getFechaSolucion() == null) {
            incidente.setFechaSolucion(LocalDate.now());
        }
        
        return incidentesRepository.save(incidente);
    }
    
    /**
     * Cerrar/resolver un incidente
     */
    public Incidentes resolverIncidente(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + idIncidente));
        
        // Buscar el estado "Resuelto"
        EstIncidente estadoResuelto = estIncidenteRepository.findById(3)
            .orElseThrow(() -> new RuntimeException("Estado 'Resuelto' no encontrado"));
        
        incidente.setEstIncidente(estadoResuelto);
        incidente.setFechaSolucion(LocalDate.now());
        
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
        
        EstIncidente estadoRevision = estIncidenteRepository.findById(2) // En Revisión
            .orElseThrow(() -> new RuntimeException("Estado 'En Revisión' no encontrado"));
        
        incidente.setEstIncidente(estadoRevision);
        return incidentesRepository.save(incidente);
    }

    /**
     * Cancelar un incidente
     */
    public Incidentes cancelarIncidente(Integer idIncidente) {
        Incidentes incidente = incidentesRepository.findById(idIncidente)
            .orElseThrow(() -> new RuntimeException("Incidente no encontrado con id: " + idIncidente));
        
        EstIncidente estadoCancelado = estIncidenteRepository.findById(4) // Cancelado
            .orElseThrow(() -> new RuntimeException("Estado 'Cancelado' no encontrado"));
        
        incidente.setEstIncidente(estadoCancelado);
        return incidentesRepository.save(incidente);
    }
}
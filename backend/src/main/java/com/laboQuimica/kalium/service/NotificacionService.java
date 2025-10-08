package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.dto.NotificacionDTO;
import com.laboQuimica.kalium.dto.NotificacionResumenDTO;
import com.laboQuimica.kalium.entity.Notificacion;
import com.laboQuimica.kalium.entity.TipoInsumo;
import com.laboQuimica.kalium.entity.Usuario;
import com.laboQuimica.kalium.repository.NotificacionRepository;
import com.laboQuimica.kalium.repository.UsuarioRepository;
import com.laboQuimica.kalium.repository.TipoInsumoRepository;
import com.laboQuimica.kalium.repository.InsumoRepository;
import com.laboQuimica.kalium.repository.QuimicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificacionService {
    
    @Autowired
    private NotificacionRepository notificacionRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private TipoInsumoRepository tipoInsumoRepository;

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private QuimicoRepository quimicoRepository;
    
    /**
     * Obtener todas las notificaciones de un usuario
     */
    public List<NotificacionDTO> obtenerPorUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Notificacion> notificaciones = notificacionRepository
            .findByUsuarioOrderByFechaCreacionDesc(usuario);
        
        return convertirADTOList(notificaciones);
    }
    
    /**
     * Obtener notificaciones no leídas de un usuario
     */
    public List<NotificacionDTO> obtenerNoLeidasPorUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Notificacion> notificaciones = notificacionRepository
            .findByUsuarioAndLeidaOrderByFechaCreacionDesc(usuario, false);
        
        return convertirADTOList(notificaciones);
    }
    
    /**
     * Contar notificaciones no leídas
     */
    public Long contarNoLeidas(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return notificacionRepository.countByUsuarioAndLeida(usuario, false);
    }
    
    /**
     * Obtener resumen de notificaciones
     */
    public NotificacionResumenDTO obtenerResumen(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Long totalNoLeidas = notificacionRepository.countByUsuarioAndLeida(usuario, false);
        
        List<Notificacion> notificacionesNoLeidas = notificacionRepository
            .findByUsuarioAndLeidaOrderByFechaCreacionDesc(usuario, false);
        
        Long bajoStock = notificacionesNoLeidas.stream()
            .filter(n -> "BAJO_STOCK".equals(n.getTipo()))
            .count();
        
        Long pedidosPendientes = notificacionesNoLeidas.stream()
            .filter(n -> "PEDIDO_PENDIENTE".equals(n.getTipo()))
            .count();
        
        Long incidentes = notificacionesNoLeidas.stream()
            .filter(n -> "INCIDENTE".equals(n.getTipo()))
            .count();
        
        return new NotificacionResumenDTO(totalNoLeidas, bajoStock, pedidosPendientes, incidentes);
    }
    
    /**
     * Marcar una notificación como leída
     */
    public NotificacionDTO marcarComoLeida(Integer idNotificacion) {
        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
        
        return convertirADTO(notificacion);
    }
    
    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    public void marcarTodasComoLeidas(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Notificacion> notificaciones = notificacionRepository
            .findByUsuarioAndLeidaOrderByFechaCreacionDesc(usuario, false);
        
        notificaciones.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(notificaciones);
    }
    
    /* Crear notificación de bajo stock para todos los administradores de laboratorio */
    public void crearNotificacionBajoStock(Integer idTipoInsumo, String mensaje) {
        // Obtener todos los ADMIN_LABORATORIO
        List<Usuario> administradores = usuarioRepository.findByRol_NombreRol("ADMIN_LABORATORIO");
        
        for (Usuario admin : administradores) {
            crearNotificacionBajoStock(idTipoInsumo, mensaje, admin.getIdUsuario());
        }
    }
    
    /**
     * Eliminar una notificación
     */
    public void eliminar(Integer idNotificacion) {
        notificacionRepository.deleteById(idNotificacion);
    }
    
    /**
     * Eliminar todas las notificaciones leídas de un usuario
     */
    public void eliminarLeidasDeUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Notificacion> notificaciones = notificacionRepository
            .findByUsuarioAndLeidaOrderByFechaCreacionDesc(usuario, true);
        
        notificacionRepository.deleteAll(notificaciones);
    }

    // Agregar este método a tu NotificacionService.java existente
    public Notificacion guardar(Notificacion notificacion) {
        return notificacionRepository.save(notificacion);
    }
    
    // ===== Métodos auxiliares =====
    
    private NotificacionDTO convertirADTO(Notificacion notificacion) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setIdNotificacion(notificacion.getIdNotificacion());
        dto.setTitulo(notificacion.getTitulo());
        dto.setMensaje(notificacion.getMensaje());
        dto.setTipo(notificacion.getTipo());
        dto.setLeida(notificacion.getLeida());
        dto.setFechaCreacion(notificacion.getFechaCreacion());
        dto.setIdUsuario(notificacion.getUsuario().getIdUsuario());
        dto.setDatosExtra(notificacion.getDatosExtra()); // ✅ Agregar el JSON completo
        
        // ✅ Extraer idTipoInsumo del JSON si existe
        if (notificacion.getDatosExtra() != null && notificacion.getDatosExtra().contains("idTipoInsumo")) {
            try {
                // Parsear el JSON manualmente (formato: {"idTipoInsumo": 123})
                String json = notificacion.getDatosExtra();
                int start = json.indexOf("\"idTipoInsumo\":") + 15;
                int end = json.indexOf(",", start);
                if (end == -1) end = json.indexOf("}", start);
                
                String idStr = json.substring(start, end).trim();
                Integer idTipoInsumo = Integer.parseInt(idStr);
                dto.setIdTipoInsumo(idTipoInsumo);
                
                // ✅ Opcional: Obtener el nombre del tipo de insumo desde la BD
                TipoInsumo tipoInsumo = tipoInsumoRepository.findById(idTipoInsumo).orElse(null);
                if (tipoInsumo != null) {
                    dto.setNombreTipoInsumo(tipoInsumo.getNombreTipoInsumo());
                }
            } catch (Exception e) {
                System.err.println("Error al parsear datosExtra: " + e.getMessage());
            }
        }
        
        return dto;
    }
    
    private List<NotificacionDTO> convertirADTOList(List<Notificacion> notificaciones) {
        return notificaciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public int verificarTodoElStock() {
        int notificacionesCreadas = 0;
        
        try {
            // Obtener todos los tipos de insumo
            List<TipoInsumo> todosTipos = tipoInsumoRepository.findAll();
            
            for (TipoInsumo tipo : todosTipos) {
                Integer stockMinimo = tipo.getStockMinimo();
                if (stockMinimo == null || stockMinimo <= 0) continue;
                
                double stockActual = 0;
                String unidad = tipo.getUnidad().getUnidad();
                
                if (tipo.getEsQuimico()) {
                    // Para químicos: sumar cantidades
                    Float cantTotal = quimicoRepository.sumCantidadByTipoInsumo(tipo.getIdTipoInsumo());
                    stockActual = (cantTotal != null) ? cantTotal.doubleValue() : 0.0;
                } else {
                    // Para insumos: contar unidades disponibles
                    Long cantidad = insumoRepository.countByTipoInsumo(tipo.getIdTipoInsumo());
                    stockActual = (cantidad != null) ? cantidad.doubleValue() : 0.0;
                }
                
                // Si el stock está bajo, crear notificación
                if (stockActual < stockMinimo) {
                    String mensaje = String.format(
                        "Stock bajo: %s - Actual: %.2f %s / Mínimo: %d %s",
                        tipo.getNombreTipoInsumo(),
                        stockActual,
                        unidad,
                        stockMinimo,
                        unidad
                    );
                    
                    // Crear notificación para todos los ADMIN_LABORATORIO
                    List<Usuario> admins = usuarioRepository.findByRol_NombreRol("ADMIN_LABORATORIO");
                    for (Usuario admin : admins) {
                        crearNotificacionBajoStock(tipo.getIdTipoInsumo(), mensaje, admin.getIdUsuario());
                        notificacionesCreadas++;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error al verificar todo el stock: " + e.getMessage());
        }
        
        return notificacionesCreadas;
    }

    // Sobrecarga del método existente para especificar el usuario
    public void crearNotificacionBajoStock(Integer idTipoInsumo, String mensaje, Integer idUsuario) {
        try {
            // Evitar duplicados: verificar si ya existe una notificación no leída para este tipo
            List<Notificacion> existentes = notificacionRepository
                .findByUsuario_IdUsuarioAndLeidaAndTipo(idUsuario, false, "BAJO_STOCK");
            
            boolean yaExiste = existentes.stream()
                .anyMatch(n -> n.getDatosExtra() != null && 
                        n.getDatosExtra().contains("\"idTipoInsumo\":" + idTipoInsumo));
            
            if (yaExiste) {
                return; // Ya existe una notificación no leída para este insumo
            }
            
            Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
            if (usuario == null) return;
            
            TipoInsumo tipoInsumo = tipoInsumoRepository.findById(idTipoInsumo).orElse(null);
            if (tipoInsumo == null) return;
            
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo("Stock bajo: " + tipoInsumo.getNombreTipoInsumo());
            notificacion.setMensaje(mensaje);
            notificacion.setTipo("BAJO_STOCK");
            notificacion.setLeida(false);
            notificacion.setUsuario(usuario);
            
            // Construir JSON manualmente
            String datosExtra = String.format("{\"idTipoInsumo\": %d}", idTipoInsumo);
            notificacion.setDatosExtra(datosExtra);
            
            notificacionRepository.save(notificacion);
        } catch (Exception e) {
            System.err.println("Error al crear notificación: " + e.getMessage());
        }
    }
    
}
package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Notificacion;
import com.laboQuimica.kalium.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    
    // Obtener todas las notificaciones de un usuario
    List<Notificacion> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
    
    // Obtener notificaciones no leídas de un usuario
    List<Notificacion> findByUsuarioAndLeidaOrderByFechaCreacionDesc(Usuario usuario, Boolean leida);
    
    // Contar notificaciones no leídas de un usuario
    Long countByUsuarioAndLeida(Usuario usuario, Boolean leida);
    
    // Obtener notificaciones por tipo
    List<Notificacion> findByUsuarioAndTipoOrderByFechaCreacionDesc(Usuario usuario, String tipo);
    
    // Buscar notificaciones por usuario, leida y tipo
    List<Notificacion> findByUsuario_IdUsuarioAndLeidaAndTipo(Integer idUsuario, Boolean leida, String tipo);
}
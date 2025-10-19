package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Devolucion;
import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.EstDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DevolucionRepository extends JpaRepository<Devolucion, Integer> {
    List<Devolucion> findByPedido(Pedido pedido);
    List<Devolucion> findByEstDevolucion(EstDevolucion estDevolucion);
    
    // ✅ MODIFICADO: Buscar devoluciones por IDUsuario del estudiante
    @Query("SELECT d FROM Devolucion d WHERE d.entrega.estudiante.usuario.idUsuario = :idUsuario")
    List<Devolucion> findByEstudiante(@Param("idUsuario") Integer idUsuario);
}

package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.Instructor;
import com.laboQuimica.kalium.entity.EstPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByInstructor(Instructor instructor);
    List<Pedido> findByEstPedido(EstPedido estPedido);
    
    /**
     * Busca pedidos aprobados cuya hora de entrega ya pasó
     * Útil para auto-cancelar pedidos vencidos
     */
    @Query("SELECT p FROM Pedido p WHERE p.estPedido.idEstPedido = 2 AND p.horario.horaInicio < :ahora")
    List<Pedido> findPedidosAprobadosVencidos(@Param("ahora") LocalDateTime ahora);
}

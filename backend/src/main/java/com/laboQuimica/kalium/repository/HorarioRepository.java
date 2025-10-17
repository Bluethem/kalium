package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    
    @Query("SELECT h FROM Horario h WHERE NOT EXISTS (" +
           " SELECT 1 FROM Pedido p" +
           " WHERE p.horario = h" +
           "   AND p.estPedido.nombreEstPedido IN ('pendiente', 'aprobado', 'Preparado')" +
           ")")
    List<Horario> findHorariosDisponibles();
}

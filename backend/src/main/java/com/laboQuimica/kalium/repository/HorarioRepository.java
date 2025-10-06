package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    
    @Query("SELECT h FROM Horario h WHERE h.idHorario NOT IN " +
           "(SELECT p.horario.idHorario FROM Pedido p WHERE p.horario IS NOT NULL)")
    List<Horario> findHorariosDisponibles();
}

package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Incidentes;
import com.laboQuimica.kalium.entity.EstIncidente;
import com.laboQuimica.kalium.entity.Estudiante;
import com.laboQuimica.kalium.entity.Devolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentesRepository extends JpaRepository<Incidentes, Integer> {
    List<Incidentes> findByEstIncidente(EstIncidente estIncidente);
    List<Incidentes> findByEstudiante(Estudiante estudiante);
    List<Incidentes> findByDevolucion(Devolucion devolucion);
    
    // Ordenar por fecha de incidente descendente (más recientes primero)
    List<Incidentes> findAllByOrderByFechaIncidenteDesc();
    
    // Buscar por estado ordenado por fecha
    List<Incidentes> findByEstIncidenteOrderByFechaIncidenteDesc(EstIncidente estIncidente);
}
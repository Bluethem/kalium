package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.DevolucionDetalle;
import com.laboQuimica.kalium.entity.Devolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DevolucionDetalleRepository extends JpaRepository<DevolucionDetalle, Integer> {
    List<DevolucionDetalle> findByDevolucion(Devolucion devolucion);
}
